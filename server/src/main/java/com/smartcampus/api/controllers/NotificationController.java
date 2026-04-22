package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Helper method to safely extract the user ID regardless of how they logged in
    private String extractUserIdSafe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // Not logged in
        }

        Object principal = authentication.getPrincipal();
        String userId = null;

        // If logged in via DevAuthController or Azure OAuth2
        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            userId = oauth2User.getAttribute("id");
            if (userId == null) {
                userId = oauth2User.getAttribute("employeeId");
            }
        }

        // Fallback for standard form login or if OAuth2 attributes are missing
        if (userId == null) {
            userId = authentication.getName();
        }

        return userId;
    }

    // 1. Get all notifications for the currently logged-in user
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        
        if (userId == null) {
            // If the user isn't logged in, gracefully return a 401 Unauthorized instead of crashing
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // 2. Mark one as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // 3. Mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        
        if (userId != null) {
            notificationService.markAllAsRead(userId);
        }
        return ResponseEntity.ok().build();
    }
}