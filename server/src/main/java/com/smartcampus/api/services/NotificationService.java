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
        return saveAndPush(notification);
    }

    public Notification sendTicketNotification(
            String recipientId,
            String type,
            String title,
            String message,
            String relatedTicketId,
            String relatedTicketTitle,
            String priority
    ) {
        Notification notification = new Notification(recipientId, title, message);
        notification.setType(type);
        notification.setRelatedTicketId(relatedTicketId);
        notification.setRelatedTicketTitle(relatedTicketTitle);
        notification.setPriority(priority);
        return saveAndPush(notification);
    }

    private Notification saveAndPush(Notification notification) {
        Notification savedNotification = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + notification.getRecipientId(), savedNotification);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to push WebSocket message: " + e.getMessage());
        }
        return savedNotification;
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getTicketNotificationsForUser(String userId) {
        return notificationRepository.findByRecipientIdAndTypeInOrderByCreatedAtDesc(userId, List.of(
                "TICKET_ASSIGNED",
                "TICKET_STATUS_CHANGED",
                "NEW_COMMENT",
                "SLA_WARNING",
                "SLA_OVERDUE",
                "TICKET_RESOLVED"
        ));
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
