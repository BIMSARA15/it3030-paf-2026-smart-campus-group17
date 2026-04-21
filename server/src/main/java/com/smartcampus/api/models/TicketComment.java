package com.smartcampus.api.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Embedded sub-document stored inside a Ticket's `comments` array.
 * Captures the resolution history / conversation between reporter,
 * technician and admin on a ticket.
 */
public class TicketComment {

    private String commentId;
    private String authorId;
    private String authorRole; // STUDENT | LECTURER | TECHNICIAN | ADMIN
    private String message;
    private LocalDateTime createdAt;

    public TicketComment() {}

    public TicketComment(String authorId, String authorRole, String message) {
        this.commentId = UUID.randomUUID().toString();
        this.authorId = authorId;
        this.authorRole = authorRole;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public String getCommentId() { return commentId; }
    public void setCommentId(String commentId) { this.commentId = commentId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
