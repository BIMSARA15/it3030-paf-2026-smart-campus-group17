package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String userEmail);
    List<Booking> findByUserId(String userId);
    @Query("{ 'status': 'APPROVED', 'reminderSent': false }")
    List<Booking> findApprovedUnremindedBookings();

    // Custom query to find approved bookings for the same resource on the same date
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $in: ['APPROVED', 'PENDING'] } }")
    List<Booking> findApprovedBookingsForResourceOnDate(String resourceId, String date);
}