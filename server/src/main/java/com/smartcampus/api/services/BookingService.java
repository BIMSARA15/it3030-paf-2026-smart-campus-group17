package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.Resource;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.ResourceRepository;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

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

    //Resource Repo to fetch the missing details
    @Autowired
    private ResourceRepository resourceRepository;

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

                //Conflict if new booking starts before existing ends AND new booking ends after existing starts
                if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                    throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
                }
            } catch (Exception e) {
                continue;
            }
        }

        // The frontend only sends resourceId. We must fetch the actual name, block, and level from the DB here!
        if (newBooking.getResourceId() != null) {
            resourceRepository.findById(newBooking.getResourceId()).ifPresent(resource -> {
                newBooking.setResourceName(resource.getResourceName()); 
                newBooking.setBlock(resource.getBlock());
                newBooking.setLevel(resource.getLevel());
            });
        }

        newBooking.setStatus("PENDING");
        newBooking.setCreatedAt(LocalDateTime.now());
        newBooking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(newBooking);

        // --- DYNAMIC NOTIFICATIONS FOR ADMIN ---
        String assetName = savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "Asset (" + savedBooking.getResourceId() + ")";
        if (savedBooking.getBlock() != null && savedBooking.getLevel() != null) {
            assetName += " - Block " + savedBooking.getBlock() + ", Lvl " + savedBooking.getLevel();
        }

        String dynamicAdminMessage = String.format(
            "A new booking request requires your approval.\n\n" +
            "🔖 Booking ID: %s\n" +
            "👤 Name: %s\n" +
            "📧 Email: %s\n" +
            "🏫 Asset: %s\n" +
            "📅 Date: %s\n" +
            "⏰ Time: %s to %s\n",
            savedBooking.getId(),
            savedBooking.getUserName(),
            savedBooking.getUserEmail(),
            assetName, 
            savedBooking.getDate(),
            savedBooking.getStartTime(),
            savedBooking.getEndTime()
        );

        if (savedBooking.getLecturer() != null && !savedBooking.getLecturer().isBlank()) {
            dynamicAdminMessage += "👨‍🏫 Lecturer in Charge: " + savedBooking.getLecturer() + "\n";
        }
        dynamicAdminMessage += "📝 Purpose: " + savedBooking.getPurpose();

        List<User> adminUsers = userRepository.findByRole("ADMIN");
        for (User admin : adminUsers) {
            notificationService.sendNotification(
                admin.getId(), 
                "New Booking Request",
                dynamicAdminMessage
            );
        }

       // --- AUTOMATED HTML EMAILS ---
        try {
            emailService.sendBookingHtmlEmail(
                savedBooking, 
                "Booking Request Received - Pending Approval", 
                "pending-email"
            );
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
            booking.setStatus(updateData.getStatus());
            booking.setUpdatedAt(LocalDateTime.now());
            
            if (updateData.getAdminNote() != null) booking.setAdminNote(updateData.getAdminNote());
            if (updateData.getRejectionReason() != null) booking.setRejectionReason(updateData.getRejectionReason());
            if (updateData.getReviewedBy() != null) booking.setReviewedBy(updateData.getReviewedBy());
            if (updateData.getCancellationReason() != null) booking.setCancellationReason(updateData.getCancellationReason());

            Booking savedBooking = bookingRepository.save(booking);

            // --- DYNAMIC NOTIFICATIONS FOR STUDENT ---
            String assetName = savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "Asset (" + savedBooking.getResourceId() + ")";
            
            String dynamicStudentMessage = String.format(
                "Your booking request has been %s.\n\n" +
                "🔖 Booking ID: %s\n" +
                "🏫 Asset: %s\n" +
                "📅 Date: %s\n" +
                "⏰ Time: %s to %s\n" +
                "👨‍💼 Reviewed By: %s\n\n",
                savedBooking.getStatus(),
                savedBooking.getId(),
                assetName,
                savedBooking.getDate(),
                savedBooking.getStartTime(),
                savedBooking.getEndTime(),
                savedBooking.getReviewedBy() != null ? savedBooking.getReviewedBy() : "Admin Officer"
            );

            if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getAdminNote() != null && !savedBooking.getAdminNote().isBlank()) {
                dynamicStudentMessage += "💬 Message from Officer: " + savedBooking.getAdminNote();
            } else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getRejectionReason() != null && !savedBooking.getRejectionReason().isBlank()) {
                dynamicStudentMessage += "❌ Reason for Rejection: " + savedBooking.getRejectionReason();
            }

            notificationService.sendNotification(
                savedBooking.getUserId(), 
                "Booking Status Update",
                dynamicStudentMessage
            );

           // --- AUTOMATED HTML EMAILS ---
            try {
                if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendBookingHtmlEmail(
                        savedBooking, 
                        "Booking APPROVED - UniBook Smart Campus", 
                        "approved-email"
                    );
                } 
                else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendBookingHtmlEmail(
                        savedBooking, 
                        "Booking REJECTED - UniBook Smart Campus", 
                        "rejected-email"
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }

            // RETURN THE SAVED BOOKING 
            return Optional.of(savedBooking);
        }
        return Optional.empty();
    }

    public Optional<Booking> checkInBooking(String id) {
        Optional<Booking> existingBooking = bookingRepository.findById(id);
        if (existingBooking.isPresent()) {
            Booking booking = existingBooking.get();
            booking.setCheckedIn(true);
            booking.setUpdatedAt(LocalDateTime.now());
            return Optional.of(bookingRepository.save(booking));
        }
        return Optional.empty();
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

            // --- NEW: OVERLAP CONFLICT CHECK FOR EDITS ---
            List<Booking> otherBookings = bookingRepository.findApprovedBookingsForResourceOnDate(
                existingBooking.getResourceId(), 
                updatedData.getDate()
            );

            LocalTime newStart = parseBookingTime(updatedData.getStartTime());
            LocalTime newEnd = parseBookingTime(updatedData.getEndTime());

            for (Booking other : otherBookings) {
                // Skip checking against the booking we are currently editing!
                if (other.getId().equals(existingBooking.getId())) {
                    continue;
                }
                
                try {
                    LocalTime existingStart = parseBookingTime(other.getStartTime());
                    LocalTime existingEnd = parseBookingTime(other.getEndTime());

                    // Conflict if new booking starts before existing ends AND new booking ends after existing starts
                    if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                        throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
                    }
                } catch (Exception e) {
                    continue;
                }
            }
            // --- END OF CONFLICT CHECK ---

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