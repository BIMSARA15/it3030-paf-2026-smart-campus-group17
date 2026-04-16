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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
        boolean profileComplete = true; // Default to true

        if (existingUser.isPresent()) {
            dbUser = existingUser.get();
        if (dbUser.getPhoneNumber() == null || dbUser.getFaculty() == null) {
                profileComplete = false;
            }
        }
        else {
            dbUser = new User();
            dbUser.setName(name);
            dbUser.setEmail(email);
            dbUser.setRole("USER"); 
            dbUser = userRepository.save(dbUser);
            profileComplete = false; // Mark as incomplete
        }

        // 4. Package the MongoDB data + Profile Picture to send back to React
        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId()); 
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("role", dbUser.getRole());
        response.put("picture", picture); 
        response.put("profileComplete", profileComplete); // Send flag to React

        // 5. Send a 200 OK Success with the data
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody User newUserRequest) {
        
        // 1. Check if the user already exists to prevent duplicates
        if (userRepository.findByEmail(newUserRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 2. Create the new user object
        User user = new User();
        user.setName(newUserRequest.getName());
        user.setEmail(newUserRequest.getEmail());
        
        // Use the role provided, or default to STUDENT
        user.setRole(newUserRequest.getRole() != null ? newUserRequest.getRole() : "STUDENT");
        
        // 3. Save the new specific fields!
        user.setFaculty(newUserRequest.getFaculty());
        
        // Only save these if they are provided (e.g. Lecturers won't have a Year/Semester)
        if (newUserRequest.getYearSemester() != null) {
            user.setYearSemester(newUserRequest.getYearSemester());
        }
        if (newUserRequest.getRegisteredCourse() != null) {
            user.setRegisteredCourse(newUserRequest.getRegisteredCourse());
        }

        // 4. Save to MongoDB
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(@AuthenticationPrincipal OAuth2User principal, @RequestBody Map<String, String> updates) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        User user = userRepository.findByEmail(principal.getAttribute("email")).orElseThrow();
        user.setPhoneNumber(updates.get("phoneNumber"));
        user.setFaculty(updates.get("faculty"));
        user.setRegisteredCourse(updates.get("registeredCourse"));
        user.setSpecialization(updates.get("specialization"));
        user.setYearSemester(updates.get("currentSemester"));
        // Update role if they selected student/lecturer during onboarding
        if (updates.containsKey("role")) user.setRole(updates.get("role").toUpperCase());
        
        userRepository.save(user);
        return ResponseEntity.ok("Profile updated");
    }
}