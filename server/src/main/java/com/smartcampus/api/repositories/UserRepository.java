package com.smartcampus.api.repositories;

import com.smartcampus.api.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    
    // Spring Boot is smart enough to write the query for this just based on the method name!
    Optional<User> findByEmail(String email);
    
    Optional<User> findByOauthId(String oauthId);
    
}