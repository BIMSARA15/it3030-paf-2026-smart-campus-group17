package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // Injecting the services needed for notifications
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
    public Booking createBooking(@RequestBody Booking booking) {
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);

        // --- NEW: Notify all Admins that a new booking was created ---
        List<User> admins = userRepository.findByRole("ADMIN"); // Assuming role is stored as "ADMIN"
        // Debugging log: Check your Spring Boot console to see if this prints!
        System.out.println("Found " + admins.size() + " admins to notify.");
        for (User admin : admins) {
            notificationService.sendNotification(
                admin.getId(), 
                "New Booking Request", 
                booking.getUserName() + " submitted a new booking request for: " + booking.getPurpose()
            );
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

            // --- NEW: Notify the User/Lecturer if their booking was Approved or Rejected ---
            String notificationTitle = "";
            String notificationMessage = "";

            if ("APPROVED".equalsIgnoreCase(updateData.getStatus())) {
                notificationTitle = "Booking Approved";
                notificationMessage = "Your booking request for '" + booking.getPurpose() + "' has been approved.";
            } else if ("REJECTED".equalsIgnoreCase(updateData.getStatus())) {
                notificationTitle = "Booking Rejected";
                notificationMessage = "Your booking request for '" + booking.getPurpose() + "' was rejected. Reason: " + updateData.getRejectionReason();
            }

            // If it's an approve or reject action, send the notification to the user who created it
            if (!notificationTitle.isEmpty() && booking.getUserId() != null) {
                notificationService.sendNotification(
                    booking.getUserId(),
                    notificationTitle,
                    notificationMessage
                );
            }

            return ResponseEntity.ok(savedBooking);
        }
        return ResponseEntity.notFound().build();
    }
}