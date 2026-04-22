package com.smartcampus.api.controllers;

import org.springframework.http.HttpStatus;
import com.smartcampus.api.models.Booking;
import com.smartcampus.api.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookingController {

    // The Controller now strictly depends on the Service, NOT the Repository
    @Autowired
    private BookingService bookingService;

    // 1. Get ALL bookings (For Admin)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // 2. Get bookings for a specific user (RESTful Query Parameter Approach)
    @GetMapping("/search") // URL will be: /api/bookings/search?email=test@sliit.lk
    public ResponseEntity<List<Booking>> getUserBookingsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(bookingService.getUserBookingsByEmail(email));
    }

    // 3. Create a new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking createdBooking = bookingService.createBooking(booking);
            // Changed from .ok() to .status(HttpStatus.CREATED)
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking); 
        } catch (Exception e) {
            // Catches the scheduling conflict exception from the service
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Update booking status
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody Booking updateData) {
        Optional<Booking> updatedBooking = bookingService.updateBookingStatus(id, updateData);
        return updatedBooking.map(ResponseEntity::ok)
                           .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 5. QR Code Check-in Endpoint
    @PutMapping("/{id}/checkin")
    public ResponseEntity<Booking> checkInBooking(@PathVariable String id) {
        Optional<Booking> checkedInBooking = bookingService.checkInBooking(id);
        return checkedInBooking.map(ResponseEntity::ok)
                             .orElseGet(() -> ResponseEntity.notFound().build());
    }
}