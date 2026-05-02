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

import com.smartcampus.api.dto.CreateBookingRequest;
import com.smartcampus.api.dto.UpdateBookingStatusRequest;
import com.smartcampus.api.dto.UpdateBookingDetailsRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "${app.frontend.url}", allowCredentials = "true") 
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings()); //200 OK Status
    }

    // Endpoint for fetching bookings by ID
    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Endpoint for searching by email 
    @GetMapping("/search") 
    public ResponseEntity<List<Booking>> getUserBookingsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getUserBookingsByEmail(email));
    }

    // Create Booking using DTO
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody CreateBookingRequest request, Authentication authentication) {
        
        // Map DTO to our Database Model
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserName(request.getUserName());
        booking.setUserId(request.getUserId());
        booking.setUserEmail(request.getUserEmail());
        booking.setUserDept(request.getUserDept());
        booking.setRequesterRole(request.getRequesterRole());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setAttendees(request.getAttendees());
        booking.setQuantity(request.getQuantity());
        booking.setLecturer(request.getLecturer());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setRequestedUtilityIds(request.getRequestedUtilityIds());

        System.out.println("\n====== [JAVA DEBUG] INCOMING BOOKING ======");
        System.out.println("Resource ID received: " + booking.getResourceId());
        System.out.println("===========================================\n");
        
        // Map Microsoft Email to Real MongoDB ID
        User authenticatedUser = null;

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            String realUserId = null;
            String emailFromAuth = null;
            
            if (principal instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) principal;
                realUserId = oauth2User.getAttribute("id");
                emailFromAuth = oauth2User.getAttribute("email");
                
                if (realUserId == null) {
                    if (emailFromAuth != null) {
                        authenticatedUser = userRepository.findByEmail(emailFromAuth).orElse(null);
                        if (authenticatedUser != null) {
                            realUserId = authenticatedUser.getId(); 
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

            if (authenticatedUser == null) {
                String lookupEmail = emailFromAuth != null ? emailFromAuth : booking.getUserEmail();
                if (lookupEmail != null) {
                    authenticatedUser = userRepository.findByEmail(lookupEmail).orElse(null);
                }
            }
        }

        if (authenticatedUser != null && authenticatedUser.getRole() != null) {
            booking.setRequesterRole(authenticatedUser.getRole().toUpperCase());
        }
        
        if (booking.getStatus() == null) {
            booking.setStatus("PENDING");
        }
        if (booking.getCreatedAt() == null) {
            booking.setCreatedAt(LocalDateTime.now());
            booking.setUpdatedAt(LocalDateTime.now());
        }
        
        try {
            // Hand off to the Service 
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking); //201 Created Status
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage())); //400 Bad Request
        }
    }

    // Update booking status using DTO
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody UpdateBookingStatusRequest request) {
        
        // Map DTO to Model
        Booking updateData = new Booking();
        updateData.setStatus(request.getStatus());
        updateData.setAdminNote(request.getAdminNote());
        updateData.setRejectionReason(request.getRejectionReason());
        updateData.setReviewedBy(request.getReviewedBy());
        updateData.setCancellationReason(request.getCancellationReason());
        updateData.setRequesterRole(request.getRequesterRole());

        Optional<Booking> updatedBookingOpt = bookingService.updateBookingStatus(id, updateData);
        
        if (updatedBookingOpt.isPresent()) {
            return ResponseEntity.ok(updatedBookingOpt.get());
        }
        return ResponseEntity.notFound().build(); //404 Not Found Status
    }

    // QR Code Check-in Endpoint
    @PutMapping("/{id}/checkin")
    public ResponseEntity<?> checkInBooking(@PathVariable String id) {
        try {
            Booking checkedInBooking = bookingService.checkInBooking(id);
            return ResponseEntity.ok(checkedInBooking);
        } catch (Exception e) {
            // Sends the custom error message back to the frontend to display
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage())); 
        }
    }

    // Delete Endpoint
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        boolean isDeleted = bookingService.deleteBooking(id);
        if (isDeleted) {
            return ResponseEntity.noContent().build(); //204 No Content Status
        }
        return ResponseEntity.notFound().build(); //404 Not Found Status
    }

    // Update an existing booking's details using DTO
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBookingDetails(@PathVariable String id, @RequestBody UpdateBookingDetailsRequest request) {
        try {
            // Map the DTO to the Booking model
            Booking updateData = new Booking();
            updateData.setDate(request.getDate());
            updateData.setStartTime(request.getStartTime());
            updateData.setEndTime(request.getEndTime());
            updateData.setPurpose(request.getPurpose());
            updateData.setAttendees(request.getAttendees());
            updateData.setLecturer(request.getLecturer());
            updateData.setSpecialRequests(request.getSpecialRequests());
            updateData.setRequestedUtilityIds(request.getRequestedUtilityIds());

            // Pass the mapped model to the service layer
            Booking updatedBooking = bookingService.updateBookingDetails(id, updateData);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage())); //400 Bad Request
        }
    }
}
