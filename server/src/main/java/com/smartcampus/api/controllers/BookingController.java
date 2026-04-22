package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") 
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // 3. Create a new booking
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking, Authentication authentication) {
        
        // --- NEW FIX: Force the correct User ID from the secure backend session ---
        // This overrides the hardcoded 'IT23345478' fallback from React
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            String realUserId = null;
            
            if (principal instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) principal;
                realUserId = oauth2User.getAttribute("id");
                if (realUserId == null) realUserId = oauth2User.getAttribute("employeeId");
            }
            if (realUserId == null) {
                realUserId = authentication.getName();
            }
            
            if (realUserId != null) {
                booking.setUserId(realUserId); // Guarantee exact match for notifications!
            }
        }
        
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);

        // Try to send notifications to Admins
        try {
            List<User> admins = userRepository.findByRole("ADMIN"); 
            for (User admin : admins) {
                String adminIdentifier = admin.getId() != null ? admin.getId() : admin.getEmail();
                if (adminIdentifier != null) {
                    notificationService.sendNotification(
                        adminIdentifier, 
                        "New Booking Request", 
                        booking.getUserName() + " submitted a new booking request for: " + booking.getPurpose()
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("FAILED to send admin notifications: " + e.getMessage());
        }

        return savedBooking;
    }

    // 4. Update booking status (Approve/Reject/Cancel)
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody Booking updateData) {
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

            // Safely notify the student
            try {
                String notificationTitle = "";
                String notificationMessage = "";

                if ("APPROVED".equalsIgnoreCase(updateData.getStatus())) {
                    notificationTitle = "Booking Approved \u2705";
                    notificationMessage = "Your booking request for '" + booking.getPurpose() + "' has been approved by " + (updateData.getReviewedBy() != null ? updateData.getReviewedBy() : "an Admin") + ".";
                } else if ("REJECTED".equalsIgnoreCase(updateData.getStatus())) {
                    notificationTitle = "Booking Rejected \u274C";
                    notificationMessage = "Your booking request for '" + booking.getPurpose() + "' was rejected. Reason: " + updateData.getRejectionReason();
                }

                if (!notificationTitle.isEmpty() && booking.getUserId() != null) {
                    System.out.println("DEBUG: Sending status notification to exactly User ID: " + booking.getUserId());
                    notificationService.sendNotification(
                        booking.getUserId(),
                        notificationTitle,
                        notificationMessage
                    );
                }
            } catch (Exception e) {
                System.err.println("FAILED to send student notification: " + e.getMessage());
            }

            return ResponseEntity.ok(savedBooking);
        }
        return ResponseEntity.notFound().build();
    }
}