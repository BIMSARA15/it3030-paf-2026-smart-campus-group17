// server/src/main/java/com/smartcampus/api/controllers/NotificationController.java
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

    @Autowired
    private UserRepository userRepository;

    private String extractUserIdSafe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null; 

        Object principal = authentication.getPrincipal();
        String userId = null;

        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            userId = oauth2User.getAttribute("id");

            if (userId == null) {
                String email = oauth2User.getAttribute("email");
                if (email != null) {
                    Optional<User> dbUser = userRepository.findByEmail(email);
                    if (dbUser.isPresent()) userId = dbUser.get().getId();
                }
            }
        }
        if (userId == null) {
            String principalName = authentication.getName();
            Optional<User> dbUser = userRepository.findByEmail(principalName);
            userId = dbUser.map(User::getId).orElse(principalName);
        }
        return userId;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/tickets")
    public ResponseEntity<List<Notification>> getTicketNotificationsForUser(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getTicketNotificationsForUser(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        if (userId != null) notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    // --- NEW: BULK DELETE ENDPOINT ---
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultipleNotifications(@RequestBody List<String> ids) {
        notificationService.deleteMultipleNotifications(ids);
        return ResponseEntity.ok().build();
    }
}
