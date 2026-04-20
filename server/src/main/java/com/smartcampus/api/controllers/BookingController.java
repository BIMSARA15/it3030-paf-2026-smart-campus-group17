package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
//@CrossOrigin(origins = "http://localhost:5173") // Allows your Vite React app to connect
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    // 1. Get ALL bookings (For Admin)
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // 2. Get bookings for a specific user (For "My Bookings")
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
        return bookingRepository.save(booking);
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

            // ADDED THIS LINE TO SAVE CANCELLATION REASON
            if (updateData.getCancellationReason() != null) booking.setCancellationReason(updateData.getCancellationReason());

            return ResponseEntity.ok(bookingRepository.save(booking));
        }
        return ResponseEntity.notFound().build();
    }
}