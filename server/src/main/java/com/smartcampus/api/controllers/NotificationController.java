package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications for the currently logged-in user
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal OidcUser principal) {
        // Remember: We mapped their Employee ID into their Azure token profile!
        // You might need to adjust this depending on exactly how you mapped their ID to the token
        String userId = principal.getAttribute("employeeId"); 
        
        // Fallback just in case Azure didn't send it in the token
        if (userId == null) userId = principal.getName(); 

        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // Mark one as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal OidcUser principal) {
        String userId = principal.getAttribute("employeeId");
        if (userId == null) userId = principal.getName();
        
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}