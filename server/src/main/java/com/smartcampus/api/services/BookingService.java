package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.repositories.BookingRepository;
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

        // 2. Teach Java how to read "05:00 PM" format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.US);
        LocalTime newStart = LocalTime.parse(newBooking.getStartTime(), formatter);
        LocalTime newEnd = LocalTime.parse(newBooking.getEndTime(), formatter);

        // 3. Check for time overlaps securely
        for (Booking existing : existingBookings) {
            try {
                LocalTime existingStart = LocalTime.parse(existing.getStartTime(), formatter);
                LocalTime existingEnd = LocalTime.parse(existing.getEndTime(), formatter);

                // Java handles the AM/PM math automatically!
                if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                    throw new Exception("Scheduling conflict: This resource is already booked during the requested time.");
                }
            } catch (Exception e) {
                // If an old record is corrupted, safely ignore it so the server doesn't crash!
                continue;
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