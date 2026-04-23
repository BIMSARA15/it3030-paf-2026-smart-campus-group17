package com.smartcampus.api.repositories;

import com.smartcampus.api.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    
    // Spring Boot is smart enough to write the query for this just based on the method name!
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    Optional<User> findByOauthId(String oauthId);

    /** Technicians who are marked available for new ticket assignment. */
    List<User> findByRoleAndAvailable(String role, boolean available);
    
}