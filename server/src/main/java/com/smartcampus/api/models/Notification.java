package com.smartcampus.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    
    // Who receives this? (Use the user's ID/EmployeeID we set up earlier)
    private String recipientId; 
    private String relatedEntityId;
    private String title;
    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Notification() {}

    public Notification(String recipientId, String title, String message, String relatedEntityId) {
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.relatedEntityId = relatedEntityId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}