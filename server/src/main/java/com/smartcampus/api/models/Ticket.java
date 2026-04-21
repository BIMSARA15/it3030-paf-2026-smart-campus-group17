package com.smartcampus.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maintenance / Incident Ticket document (collection: tickets).
 *
 * - resourceId references a Module A resource (facility / asset).
 * - reportedByUserId references the user that opened the ticket.
 * - assignedTechnicianId is filled in once an admin assigns the ticket.
 * - imageUrls is capped at 3 entries (validated in the service layer).
 * - ticketCode is a human-friendly identifier (e.g. TKT-001) shown in the UI.
 * - resolutionNote is the latest "what was done" message a technician posts
 *   when they advance the ticket — a copy is also pushed onto `comments`.
 */
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String ticketCode;

    private String title;
    private String description;

    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;

    private String reportedByUserId;
    private String assignedTechnicianId;
    private String resourceId;
    private String contactInfo;

    private List<String> imageUrls = new ArrayList<>();
    private List<TicketComment> comments = new ArrayList<>();

    private String resolutionNote;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Ticket() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getReportedByUserId() { return reportedByUserId; }
    public void setReportedByUserId(String reportedByUserId) { this.reportedByUserId = reportedByUserId; }

    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(String assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<TicketComment> getComments() { return comments; }
    public void setComments(List<TicketComment> comments) { this.comments = comments; }

    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
