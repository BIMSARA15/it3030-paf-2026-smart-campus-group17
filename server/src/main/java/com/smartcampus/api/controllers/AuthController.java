package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> getUser(@AuthenticationPrincipal OAuth2User principal) {
        // 1. If not logged in, throw a 401 Unauthorized Error so React knows!
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        // 2. Extract the data Google/Microsoft sent us
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

        // 3. Check if this user already exists in MongoDB Atlas
        Optional<User> existingUser = userRepository.findByEmail(email);
        User dbUser;

        if (existingUser.isPresent()) {
            dbUser = existingUser.get();
        } else {
            dbUser = new User();
            dbUser.setName(name);
            dbUser.setEmail(email);
            dbUser.setRole("USER"); 
            dbUser = userRepository.save(dbUser);
        }

        // 4. Package the MongoDB data + Profile Picture to send back to React
        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId()); 
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("role", dbUser.getRole());
        response.put("picture", picture); 

        // 5. Send a 200 OK Success with the data
        return ResponseEntity.ok(response);
    }
}