package com.smartcampus.api.controllers;

import org.springframework.http.HttpStatus;
import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.BookingService;
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

    // --- ALL INJECTIONS KEPT (Yours + Teammate's) ---
    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository; // Kept so your frontend API doesn't break

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 1. YOUR endpoint for fetching bookings by ID
    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // 2. TEAMMATE'S endpoint for searching by email
    @GetMapping("/search") 
    public ResponseEntity<List<Booking>> getUserBookingsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getUserBookingsByEmail(email));
    }

 // 3. MERGED Create Booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        
        // --- ULTIMATE FIX: Map Microsoft Email to Real MongoDB ID ---
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            String realUserId = null;
            
            if (principal instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) principal;
                
                realUserId = oauth2User.getAttribute("id");
                
                if (realUserId == null) {
                    String email = oauth2User.getAttribute("email");
                    if (email != null) {
                        Optional<User> dbUser = userRepository.findByEmail(email);
                        if (dbUser.isPresent()) {
                            realUserId = dbUser.get().getId(); 
                        }
                    }
                }
            }
            
            if (realUserId == null) {
                realUserId = authentication.getName();
            }
            
            if (realUserId != null) {
                booking.setUserId(realUserId); 
            }
        }
        
        // --- SAFETY NET: Re-add these lines in case the Service forgets them! ---
        if (booking.getStatus() == null) {
            booking.setStatus("PENDING");
        }
        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(LocalDateTime.now());
            booking.setUpdatedAt(LocalDateTime.now());
        }
        
        try {
            // Hand off to teammate's service
            Booking createdBooking = bookingService.createBooking(booking);
            
            // Try to send notifications to Admins
            try {
                List<User> admins = userRepository.findByRole("ADMIN"); 
                for (User admin : admins) {
                    String adminIdentifier = admin.getId() != null ? admin.getId() : admin.getEmail();
                    if (adminIdentifier != null) {
                        notificationService.sendNotification(
                            adminIdentifier, 
                            "New Booking Request", 
                            createdBooking.getUserName() + " submitted a new booking request for: " + createdBooking.getPurpose()
                        );
                    }
                }
            } catch (Exception e) {
                System.err.println("FAILED to send admin notifications: " + e.getMessage());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking); 
            
        } catch (Exception e) {
            // --- FIX: Return JSON instead of raw text so React doesn't crash ---
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // 4. MERGED Update booking status
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody Booking updateData) {
        // --- TEAMMATE'S FIX: Use Service for updating ---
        Optional<Booking> updatedBookingOpt = bookingService.updateBookingStatus(id, updateData);
        
        if (updatedBookingOpt.isPresent()) {
            Booking booking = updatedBookingOpt.get();

            // --- YOUR FIX: Safely notify the student ---
            try {
                String notificationTitle = "";
                String notificationMessage = "";

                if ("APPROVED".equalsIgnoreCase(updateData.getStatus())) {
                    notificationTitle = "Booking Approved ✅";
                    notificationMessage = "Your booking request for '" + booking.getPurpose() + "' has been approved by " + (updateData.getReviewedBy() != null ? updateData.getReviewedBy() : "an Admin") + ".";
                } else if ("REJECTED".equalsIgnoreCase(updateData.getStatus())) {
                    notificationTitle = "Booking Rejected ❌";
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

            return ResponseEntity.ok(booking);
        }
        return ResponseEntity.notFound().build();
    }

    // 5. TEAMMATE'S QR Code Check-in Endpoint
    @PutMapping("/{id}/checkin")
    public ResponseEntity<Booking> checkInBooking(@PathVariable String id) {
        Optional<Booking> checkedInBooking = bookingService.checkInBooking(id);
        return checkedInBooking.map(ResponseEntity::ok)
                               .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 6. TEAMMATE'S Delete Endpoint
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        boolean isDeleted = bookingService.deleteBooking(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build(); 
        }
        return ResponseEntity.notFound().build(); 
    }

    // 7. Update an existing booking's details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBookingDetails(@PathVariable String id, @RequestBody Booking bookingDetails) {
        try {
            Booking updatedBooking = bookingService.updateBookingDetails(id, bookingDetails);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}