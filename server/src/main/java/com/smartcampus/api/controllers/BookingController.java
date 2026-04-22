package com.smartcampus.api.controllers;

import org.springframework.http.HttpStatus;
import com.smartcampus.api.models.Booking;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.BookingRepository;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.BookingService;
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
            // Hand off to the Service (which now handles the saving AND the dynamic notifications cleanly)
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking); 
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // 4. MERGED Update booking status
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody Booking updateData) {
        // --- TEAMMATE'S FIX: Use Service for updating (Service handles notifications now!) ---
        Optional<Booking> updatedBookingOpt = bookingService.updateBookingStatus(id, updateData);
        
        if (updatedBookingOpt.isPresent()) {
            return ResponseEntity.ok(updatedBookingOpt.get());
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
}