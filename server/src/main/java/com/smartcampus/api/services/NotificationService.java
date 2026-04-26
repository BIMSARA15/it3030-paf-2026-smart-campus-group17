// server/src/main/java/com/smartcampus/api/services/NotificationService.java
package com.smartcampus.api.services;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification sendNotification(String recipientId, String title, String message) {
        Notification notification = new Notification(recipientId, title, message);
        Notification savedNotification = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + recipientId, savedNotification);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to push WebSocket message: " + e.getMessage());
        }
        return savedNotification;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // --- NEW: BULK DELETE ---
    public void deleteMultipleNotifications(List<String> notificationIds) {
        notificationRepository.deleteAllById(notificationIds);
    }
}