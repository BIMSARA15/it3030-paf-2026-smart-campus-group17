package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Find all notifications for a user, sorted newest to oldest
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientIdAndTypeInOrderByCreatedAtDesc(String recipientId, List<String> types);
    
    // Find only the unread ones (to show a badge count like "🔴 3")
    List<Notification> findByRecipientIdAndIsReadFalse(String recipientId);
}
