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

    // 1. INJECT THE EMAIL SERVICE HERE
    @Autowired
    private EmailService emailService;

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
        
        Booking savedBooking = bookingRepository.save(newBooking);

        // -------------------------------------------------------------
        // NEW: SEND AUTOMATED EMAILS FOR NEW BOOKING
        // -------------------------------------------------------------
        try {
            // Email the user confirming we got their request
            emailService.sendEmail(
                savedBooking.getUserEmail(), 
                "Booking Request Received", 
                "We have received your booking request for " + savedBooking.getDate() + 
                " from " + savedBooking.getStartTime() + " to " + savedBooking.getEndTime() + 
                ". It is currently PENDING admin approval. You will be notified once reviewed."
            );

            // Notify the Admin team that a new booking needs review
            // (You can replace this with a specific admin email or a distribution list)
            emailService.sendEmail(
                "admin@smartcampus.lk", // Placeholder for your admin email
                "ACTION REQUIRED: New Booking Request", 
                "A new booking request has been made by " + savedBooking.getUserEmail() + 
                " for date: " + savedBooking.getDate() + ". Please check the dashboard to approve or reject."
            );
        } catch (Exception e) {
            System.err.println("Failed to send booking creation emails: " + e.getMessage());
        }

        return savedBooking;
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

            // -------------------------------------------------------------
            // NEW: SEND AUTOMATED EMAILS FOR APPROVAL/REJECTION
            // -------------------------------------------------------------
            try {
                if ("APPROVED".equalsIgnoreCase(savedBooking.getStatus())) {
                    emailService.sendEmail(
                        savedBooking.getUserEmail(),
                        "Booking APPROVED!",
                        "Great news! Your booking request for " + savedBooking.getDate() + 
                        " (" + savedBooking.getStartTime() + " to " + savedBooking.getEndTime() + ") has been APPROVED."
                    );
                } 
                else if ("REJECTED".equalsIgnoreCase(savedBooking.getStatus())) {
                    String reason = savedBooking.getRejectionReason() != null ? savedBooking.getRejectionReason() : "No reason provided.";
                    emailService.sendEmail(
                        savedBooking.getUserEmail(),
                        "Booking REJECTED",
                        "Unfortunately, your booking request for " + savedBooking.getDate() + 
                        " has been REJECTED by the administrator.\n\nReason: " + reason
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send status update email: " + e.getMessage());
            }

            return Optional.of(savedBooking);
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