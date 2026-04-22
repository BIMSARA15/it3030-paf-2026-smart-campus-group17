package com.smartcampus.api.services;

import com.smartcampus.api.models.Booking;
import com.smartcampus.api.repositories.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Service
public class ReminderService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EmailService emailService;

    // This runs every 5 minutes (300,000 milliseconds)
    @Scheduled(fixedRate = 300000) 
    public void sendUpcomingBookingReminders() {
        
        // 1. Get real data: Fetch all approved bookings where reminderSent is still false
        List<Booking> upcomingBookings = bookingRepository.findApprovedUnremindedBookings();

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.US);

        for (Booking booking : upcomingBookings) {
            try {
                // 2. Convert your String date and time into a real Java LocalDateTime object
                LocalDate bookingDate = LocalDate.parse(booking.getDate());
                LocalTime bookingTime = LocalTime.parse(booking.getStartTime(), timeFormatter);
                LocalDateTime bookingDateTime = LocalDateTime.of(bookingDate, bookingTime);

                // 3. Calculate how many minutes are left until the booking starts
                Duration duration = Duration.between(now, bookingDateTime);
                long minutesUntilBooking = duration.toMinutes();

                // 4. If the booking is in the future AND starts within the next 2 hours (120 minutes)
                if (minutesUntilBooking > 0 && minutesUntilBooking <= 120) {
                    
                    // Send the email (Using Resource ID instead of Name to fix the error)
                    emailService.sendEmail(
                        booking.getUserEmail(), 
                        "Reminder: Upcoming Booking in 2 Hours", 
                        "Hello " + booking.getUserName() + ",\n\nYour booking for Resource ID: " + booking.getResourceId() + " starts soon at " + booking.getStartTime() + "!\n\nPlease make sure to arrive on time."
                    );
                    
                    // Mark as sent and save to database so we don't spam them every 5 minutes!
                    booking.setReminderSent(true); 
                    bookingRepository.save(booking);
                    System.out.println("Reminder sent for booking: " + booking.getId());
                }
            } catch (Exception e) {
                // If a student typed a weird date format, skip it without crashing the server
                System.err.println("Could not process reminder for booking ID " + booking.getId() + ": " + e.getMessage());
            }
        }
    }
}