package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public Map<String, Object> getUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return null;
        }

        // 1. Extract the data Google sent us
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

        // 2. Check if this user already exists in MongoDB Atlas
        Optional<User> existingUser = userRepository.findByEmail(email);
        User dbUser;

        if (existingUser.isPresent()) {
            // User exists! Grab their record so we know their real role
            dbUser = existingUser.get();
        } else {
            // Brand new user! Create a record for them with the default "USER" role
            dbUser = new User();
            dbUser.setName(name);
            dbUser.setEmail(email);
            dbUser.setRole("USER"); 
            // Save them to the database
            dbUser = userRepository.save(dbUser);
        }

        // 3. Package the MongoDB data + Google Picture to send back to React
        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId()); // The MongoDB _id
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("role", dbUser.getRole());
        response.put("picture", picture); // Keep the Google profile picture

        return response;
    }
}