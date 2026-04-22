package com.smartcampus.api.services;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // 👈 1. NEW IMPORT
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // 👈 2. NEW: Inject the WebSocket messaging template
    @Autowired
    private SimpMessagingTemplate messagingTemplate; 

    // 1. Send a new notification
    public Notification sendNotification(String recipientId, String title, String message) {
        // Create and save to MongoDB (Your original code)
        Notification notification = new Notification(recipientId, title, message);
        Notification savedNotification = notificationRepository.save(notification);

       // 👇 NEW: Explicitly route the message to a custom topic path for this specific user
        try {
            messagingTemplate.convertAndSend(
                "/topic/notifications/" + recipientId, 
                savedNotification
            );
            System.out.println("DEBUG: Real-time WebSocket message pushed to: /topic/notifications/" + recipientId);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to push WebSocket message: " + e.getMessage());
        }

        return savedNotification;
    }

    // 2. Get a user's notifications
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    // 3. Mark a specific notification as Read
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    // 4. Mark ALL notifications as Read
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}