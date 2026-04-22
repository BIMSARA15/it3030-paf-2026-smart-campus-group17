package com.smartcampus.api.services;

import com.smartcampus.api.models.Notification;
import com.smartcampus.api.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // 1. Send a new notification
    public Notification sendNotification(String recipientId, String title, String message) {
        Notification notification = new Notification(recipientId, title, message);
        return notificationRepository.save(notification);
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