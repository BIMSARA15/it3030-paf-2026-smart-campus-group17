package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookingsByEmail(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public Booking createBooking(Booking newBooking) throws Exception {
        // 1. Fetch all approved bookings for this resource on this specific date
        List<Booking> existingBookings = bookingRepository.findApprovedBookingsForResourceOnDate(
            newBooking.getResourceId(), 
            newBooking.getDate()
        );

        // 2. Convert times to comparable formats (e.g., "14:00" -> 1400)
        int newStart = Integer.parseInt(newBooking.getStartTime().replace(":", ""));
        int newEnd = Integer.parseInt(newBooking.getEndTime().replace(":", ""));

        // 3. Check for time overlaps
        for (Booking existing : existingBookings) {
            int existingStart = Integer.parseInt(existing.getStartTime().replace(":", ""));
            int existingEnd = Integer.parseInt(existing.getEndTime().replace(":", ""));

            if (newStart < existingEnd && newEnd > existingStart) {
                throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
            }
        }

        // 4. If no conflict, save the booking
        newBooking.setStatus("PENDING");
        newBooking.setCreatedAt(LocalDateTime.now());
        newBooking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(newBooking);
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

            return Optional.of(bookingRepository.save(booking));
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

    // Delete booking method (for cancellation)
    public boolean deleteBooking(String id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }
}