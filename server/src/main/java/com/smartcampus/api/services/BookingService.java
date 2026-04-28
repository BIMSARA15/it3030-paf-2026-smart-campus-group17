package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.ResourceRepository;
import com.smartcampus.api.repositories.UtilityRepository;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.time.LocalDate;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UtilityRepository utilityRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookingsByEmail(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public Booking createBooking(Booking newBooking) throws Exception {
        List<Booking> existingBookings = bookingRepository.findApprovedBookingsForResourceOnDate(
            newBooking.getResourceId(), 
            newBooking.getDate()
        );

        LocalTime newStart = parseBookingTime(newBooking.getStartTime());
        LocalTime newEnd = parseBookingTime(newBooking.getEndTime());

        for (Booking existing : existingBookings) {
            try {
                LocalTime existingStart = parseBookingTime(existing.getStartTime());
                LocalTime existingEnd = parseBookingTime(existing.getEndTime());

                if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                    throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
                }
            } catch (Exception e) {
                continue;
            }
        }

        // Fetch the actual names and manage quantities
        if (newBooking.getResourceId() != null) {
            resourceRepository.findById(newBooking.getResourceId()).ifPresent(resource -> {
                newBooking.setResourceName(resource.getResourceName()); 
                newBooking.setBlock(resource.getBlock());
                newBooking.setLevel(resource.getLevel());
            });
            
            if (newBooking.getQuantity() != null && newBooking.getQuantity() > 0) {
                utilityRepository.findById(newBooking.getResourceId()).ifPresent(utility -> {
                    int updatedQuantity = Math.max(0, utility.getQuantity() - newBooking.getQuantity());
                    utility.setQuantity(updatedQuantity);
                    
                    if (newBooking.getResourceName() == null) {
                        newBooking.setResourceName(utility.getUtilityName());
                    }
                    
                    utilityRepository.save(utility);
                });
            }
        }

        newBooking.setStatus("PENDING");
        newBooking.setCreatedAt(LocalDateTime.now());
        newBooking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(newBooking);

       // --- 1. ADMIN NOTIFICATIONS & EMAILS ---
        String cleanResourceName = savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "Asset (" + savedBooking.getResourceId() + ")";

        // Keep this plain text version ONLY for the WebSocket Real-Time Notification popup
        // Keep this plain text version ONLY for the WebSocket Real-Time Notification popup
        String dynamicAdminMessage = String.format(
            "A new booking request requires your approval.\n\n🔖 Booking ID: %s\n👤 Name: %s\n📧 Email: %s\n🏫 Asset: %s\n📅 Date: %s\n⏰ Time: %s to %s",
            savedBooking.getId(), savedBooking.getUserName(), savedBooking.getUserEmail(), cleanResourceName, savedBooking.getDate(), savedBooking.getStartTime(), savedBooking.getEndTime()
        );

        List<User> adminUsers = userRepository.findAll().stream()
            .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("ADMIN"))
            .collect(Collectors.toList());

        for (User admin : adminUsers) {
            notificationService.sendNotification(admin.getId(), "New Booking Request", dynamicAdminMessage);
            
            // SEND BEAUTIFUL HTML EMAIL TO ADMIN
            if (admin.getEmail() != null) {
                try {
                   emailService.sendAdminBookingHtmlEmail(
                        savedBooking,
                        admin.getEmail(),
                        admin.getName(), // 1. Admin Name first
                        "ACTION REQUIRED: New Booking Request", // 2. Subject second
                        "admin-booking-email" // 3. Template Name third
                    );
                } catch (Exception e) {
                    System.err.println("Failed to email admin: " + e.getMessage());
                }
            }
        }

        // --- 2. AUTOMATED HTML EMAIL TO STUDENT ---
        try {
            emailService.sendBookingHtmlEmail(savedBooking, "Booking Request Received - Pending Approval", "pending-email");
        } catch (Exception e) {
            System.err.println("Failed to send booking creation emails: " + e.getMessage());
        }

        return savedBooking;
    }

    private LocalTime parseBookingTime(String time) {
        if (time == null || time.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking time is required.");
        }
        String normalized = time.trim().toUpperCase(Locale.US);
        if (normalized.contains("AM") || normalized.contains("PM")) {
            return LocalTime.parse(normalized, DateTimeFormatter.ofPattern("h:mm a", Locale.US));
        }
        return LocalTime.parse(normalized, DateTimeFormatter.ofPattern("HH:mm", Locale.US));
    }

    public Optional<Booking> updateBookingStatus(String id, Booking updateData) {
        Optional<Booking> existingBooking = bookingRepository.findById(id);
        
        if (existingBooking.isPresent()) {
            Booking booking = existingBooking.get();
            String oldStatus = booking.getStatus(); 
            
            booking.setStatus(updateData.getStatus());
            booking.setUpdatedAt(LocalDateTime.now());
            
            if (updateData.getAdminNote() != null) booking.setAdminNote(updateData.getAdminNote());
            if (updateData.getRejectionReason() != null) booking.setRejectionReason(updateData.getRejectionReason());
            if (updateData.getReviewedBy() != null) booking.setReviewedBy(updateData.getReviewedBy());
            if (updateData.getCancellationReason() != null) booking.setCancellationReason(updateData.getCancellationReason());

            Booking savedBooking = bookingRepository.save(booking);

            // Restore equipment quantity if the booking is rejected or cancelled
            if (!"REJECTED".equalsIgnoreCase(oldStatus) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
                if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus()) || "CANCELLED".equalsIgnoreCase(savedBooking.getStatus())) {
                    if (savedBooking.getQuantity() != null && savedBooking.getQuantity() > 0) {
                        utilityRepository.findById(savedBooking.getResourceId()).ifPresent(utility -> {
                            utility.setQuantity(utility.getQuantity() + savedBooking.getQuantity());
                            utilityRepository.save(utility);
                        });
                    }
                }
            }

            // --- NOTIFICATIONS FOR STUDENT ---
            String assetName = savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "Asset (" + savedBooking.getResourceId() + ")";
            String dynamicStudentMessage = String.format(
                "Your booking request has been %s.\n\n🔖 Booking ID: %s\n🏫 Asset: %s\n📅 Date: %s\n⏰ Time: %s to %s\n👨‍💼 Reviewed By: %s\n\n",
                savedBooking.getStatus(), savedBooking.getId(), assetName, savedBooking.getDate(), savedBooking.getStartTime(), savedBooking.getEndTime(),
                savedBooking.getReviewedBy() != null ? savedBooking.getReviewedBy() : "Admin Officer"
            );

            if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getAdminNote() != null && !savedBooking.getAdminNote().isBlank()) {
                dynamicStudentMessage += "💬 Message from Officer: " + savedBooking.getAdminNote();
            } else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getRejectionReason() != null && !savedBooking.getRejectionReason().isBlank()) {
                dynamicStudentMessage += "❌ Reason for Rejection: " + savedBooking.getRejectionReason();
            }
            else if ("CANCELLED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getCancellationReason() != null && !savedBooking.getCancellationReason().isBlank()) {
                dynamicStudentMessage += "⚠️ Reason for Cancellation: " + savedBooking.getCancellationReason();
            }

            notificationService.sendNotification(savedBooking.getUserId(), "Booking Status Update", dynamicStudentMessage);

            // --- HTML EMAILS TO STUDENT ---
            try {
                if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendBookingHtmlEmail(savedBooking, "Booking APPROVED - UniBook Smart Campus", "approved-email");
                } 
                else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendBookingHtmlEmail(savedBooking, "Booking REJECTED - UniBook Smart Campus", "rejected-email");
                }
                else if ("CANCELLED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendBookingHtmlEmail(savedBooking, "Booking CANCELLED - UniBook Smart Campus", "cancelled-email");
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }

            return Optional.of(savedBooking);
        }
        return Optional.empty();
    }

    public Booking checkInBooking(String id) throws Exception {
        Optional<Booking> existingBooking = bookingRepository.findById(id);
        if (existingBooking.isPresent()) {
            Booking booking = existingBooking.get();

            if (booking.isCheckedIn()) {
                throw new Exception("Student is already checked in.");
            }

            LocalDate bookingDate;
            try {
                bookingDate = LocalDate.parse(booking.getDate());
            } catch (Exception e) {
                throw new Exception("Invalid booking date format.");
            }
            
            LocalTime startTime = parseBookingTime(booking.getStartTime());
            LocalTime endTime = parseBookingTime(booking.getEndTime());

            LocalDateTime now = LocalDateTime.now();
            LocalDate today = now.toLocalDate();
            LocalTime currentTime = now.toLocalTime();

            if (!today.isEqual(bookingDate)) {
                if (today.isBefore(bookingDate)) {
                    throw new Exception("Check-in failed: Booking is scheduled for a future date (" + booking.getDate() + ").");
                } else {
                    throw new Exception("Check-in failed: Booking date (" + booking.getDate() + ") has already passed.");
                }
            }

            if (currentTime.isBefore(startTime.minusMinutes(15))) {
                throw new Exception("Check-in failed: Too early. You can only check in 15 minutes before the start time (" + booking.getStartTime() + ").");
            }
            if (currentTime.isAfter(endTime)) {
                throw new Exception("Check-in failed: The booking time has already ended.");
            }

            booking.setCheckedIn(true);
            booking.setCheckInTime(now); 
            booking.setUpdatedAt(now);
            return bookingRepository.save(booking);
        }
        throw new Exception("Booking not found.");
    }

    public boolean deleteBooking(String id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public Booking updateBookingDetails(String id, Booking updatedData) throws Exception {
        Optional<Booking> existingBookingOpt = bookingRepository.findById(id);

        if (existingBookingOpt.isPresent()) {
            Booking existingBooking = existingBookingOpt.get();

            List<Booking> otherBookings = bookingRepository.findApprovedBookingsForResourceOnDate(
                existingBooking.getResourceId(), 
                updatedData.getDate()
            );

            LocalTime newStart = parseBookingTime(updatedData.getStartTime());
            LocalTime newEnd = parseBookingTime(updatedData.getEndTime());

            for (Booking other : otherBookings) {
                if (other.getId().equals(existingBooking.getId())) {
                    continue;
                }
                try {
                    LocalTime existingStart = parseBookingTime(other.getStartTime());
                    LocalTime existingEnd = parseBookingTime(other.getEndTime());

                    if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                        throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
                    }
                } catch (Exception e) {
                    continue;
                }
            }

            existingBooking.setDate(updatedData.getDate());
            existingBooking.setStartTime(updatedData.getStartTime());
            existingBooking.setEndTime(updatedData.getEndTime());
            existingBooking.setPurpose(updatedData.getPurpose());
            existingBooking.setAttendees(updatedData.getAttendees());
            existingBooking.setLecturer(updatedData.getLecturer());
            existingBooking.setSpecialRequests(updatedData.getSpecialRequests());
            existingBooking.setRequestedUtilityIds(updatedData.getRequestedUtilityIds());
            existingBooking.setUpdatedAt(LocalDateTime.now());

            return bookingRepository.save(existingBooking);
        }
        throw new Exception("Booking not found");
    }
}