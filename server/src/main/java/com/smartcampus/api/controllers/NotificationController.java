package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // INJECT THE USER REPO HERE TOO!
    @Autowired
    private UserRepository userRepository;

    // Helper method to safely extract the REAL Database ID
    private String extractUserIdSafe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; 
        }

        Object principal = authentication.getPrincipal();
        String userId = null;

        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            
            // 1. Try Dev Account ID
            userId = oauth2User.getAttribute("id");

            // 2. Real Microsoft Login: Match email to database!
            if (userId == null) {
                String email = oauth2User.getAttribute("email");
                if (email != null) {
                    Optional<User> dbUser = userRepository.findByEmail(email);
                    if (dbUser.isPresent()) {
                        userId = dbUser.get().getId(); // Securely returns SS12345678, etc.
                    }
                }
            }
        }

        // 3. Ultimate Fallback
        if (userId == null) {
            userId = authentication.getName();
        }

        return userId;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        if (userId != null) {
            notificationService.markAllAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }
}