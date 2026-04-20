package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    // Custom query to find bookings for a specific user
    List<Booking> findByUserId(String userId);
}