package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User; // 👈 FIX 1: This imports the User and fixes all the errors!
import com.smartcampus.api.repositories.BookingRepository;
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

        newBooking.setStatus("PENDING");
        newBooking.setCreatedAt(LocalDateTime.now());
        newBooking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(newBooking);

        // --- DYNAMIC NOTIFICATIONS FOR ADMIN ---
        String dynamicAdminMessage = String.format(
            "A new booking request requires your approval.\n\n" +
            "👤 Name: %s\n" +
            "📧 Email: %s\n" +
            "🆔 ID Number: %s\n" +
            "🏢 Resource: %s\n" +
            "📅 Date: %s\n" +
            "⏰ Time: %s to %s\n" +
            "📝 Purpose: %s",
            savedBooking.getUserName(),
            savedBooking.getUserEmail(),
            savedBooking.getUserId(),
            savedBooking.getResourceId(), 
            savedBooking.getDate(),
            savedBooking.getStartTime(),
            savedBooking.getEndTime(),
            savedBooking.getPurpose()
        );

        List<User> adminUsers = userRepository.findByRole("ADMIN");
        for (User admin : adminUsers) {
            notificationService.sendNotification(
                admin.getId(), 
                "New Booking Request",
                dynamicAdminMessage
            );
        }

       // --- -AUTOMATED HTML EMAILSs ---
        try {
            // Send the beautiful PENDING email to the user
            emailService.sendBookingHtmlEmail(
                savedBooking, 
                "Booking Request Received - Pending Approval", 
                "pending-email" // This matches the filename exactly (without .html)
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
            String dynamicStudentMessage = String.format(
                "Your booking request has been %s.\n\n" +
                "🏢 Resource: %s\n" +
                "📅 Date: %s\n" +
                "⏰ Time: %s to %s\n\n",
                savedBooking.getStatus(),
                savedBooking.getResourceId(),
                savedBooking.getDate(),
                savedBooking.getStartTime(),
                savedBooking.getEndTime()
            );

            if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getAdminNote() != null) {
                dynamicStudentMessage += "📝 Admin Note: " + savedBooking.getAdminNote();
            } else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus()) && savedBooking.getRejectionReason() != null) {
                dynamicStudentMessage += "❌ Reason: " + savedBooking.getRejectionReason();
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
                        "approved-email" // Matches the filename
                    );
                } 
                else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus())) {
                    // You can keep the old plain text one for rejections, or create a rejected-email.html later!
                    emailService.sendBookingHtmlEmail(
                        savedBooking, 
                        "Booking REJECTED - UniBook Smart Campus", 
                        "rejected-email" // Matches the filename
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }
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
    
    // Update booking details
    public Booking updateBookingDetails(String id, Booking updatedData) throws Exception {
        Optional<Booking> existingBookingOpt = bookingRepository.findById(id);

        if (existingBookingOpt.isPresent()) {
            Booking existingBooking = existingBookingOpt.get();

            // Update the fields
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
