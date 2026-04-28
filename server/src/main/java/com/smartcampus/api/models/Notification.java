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
    
    private String title;
    private String message;
    private String type;
    private String relatedTicketId;
    private String relatedTicketTitle;
    private String priority;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Notification() {}

    public Notification(String recipientId, String title, String message) {
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getRelatedTicketId() { return relatedTicketId; }
    public void setRelatedTicketId(String relatedTicketId) { this.relatedTicketId = relatedTicketId; }
    public String getRelatedTicketTitle() { return relatedTicketTitle; }
    public void setRelatedTicketTitle(String relatedTicketTitle) { this.relatedTicketTitle = relatedTicketTitle; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
