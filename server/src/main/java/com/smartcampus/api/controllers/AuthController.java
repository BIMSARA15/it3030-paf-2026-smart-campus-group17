package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- 1. Handles OAuth2 and Dev Logins ---
    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String email = null;
        String picture = null;
        String name = null;
        
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
            picture = oauthUser.getAttribute("picture");
            name = oauthUser.getAttribute("name"); 
        } else {
            email = authentication.getName();
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isEmpty()) {
            if (authentication.getPrincipal() instanceof OAuth2User) {
                Map<String, Object> holdResponse = new HashMap<>();
                holdResponse.put("email", email);
                holdResponse.put("name", name);
                holdResponse.put("picture", picture);
                holdResponse.put("requiresRegistration", true); 
                return ResponseEntity.ok(holdResponse);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found in DB");
        }

        User dbUser = existingUser.get();
        boolean profileComplete = (dbUser.getPhoneNumber() != null && dbUser.getFaculty() != null);

        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId()); 
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("role", dbUser.getRole());
        response.put("picture", picture); 
        response.put("profileComplete", profileComplete);

        return ResponseEntity.ok(response);
    }

    // --- 2. Secured Profile Completion (OAuth) ---
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(Authentication authentication, @RequestBody Map<String, String> updates) {
        
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = null;
        String name = null;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");
        } else {
            email = authentication.getName(); 
        }

        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        String requestedRole = updates.get("role") != null ? updates.get("role").toUpperCase() : "STUDENT";
        
        if (userOpt.isEmpty()) {
            if (requestedRole.equals("ADMIN") || requestedRole.equals("TECHNICIAN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Security Violation: Cannot self-register privileged accounts.");
            }
            
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : email.split("@")[0]);
            user.setRole(requestedRole);
        } else {
            user = userOpt.get();
        }

        if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
        if (updates.containsKey("faculty")) user.setFaculty(updates.get("faculty"));
        if (updates.containsKey("specialization")) user.setSpecialization(updates.get("specialization"));
        if (updates.containsKey("currentSemester")) user.setYearSemester(updates.get("currentSemester"));

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated and saved to DB!");
    }
}