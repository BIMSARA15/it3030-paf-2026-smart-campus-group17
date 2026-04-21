package com.smartcampus.api.dto;

import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.TicketCategory;
import com.smartcampus.api.models.TicketComment;
import com.smartcampus.api.models.TicketPriority;
import com.smartcampus.api.models.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Serialised view of a Ticket returned by the controller.
 * Resolves the human names for the reporter and assigned technician so
 * the UI doesn't need a second round-trip to render a card.
 */
public class TicketResponse {

    private String id;
    private String ticketCode;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private String reportedByUserId;
    private String reporterName;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String resourceId;
    private String contactInfo;
    private List<String> imageUrls;
    private List<TicketComment> comments;
    private String resolutionNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TicketResponse() {}

    public static TicketResponse from(Ticket t, String reporterName, String assignedTechnicianName) {
        TicketResponse r = new TicketResponse();
        r.id = t.getId();
        r.ticketCode = t.getTicketCode();
        r.title = t.getTitle();
        r.description = t.getDescription();
        r.status = t.getStatus();
        r.priority = t.getPriority();
        r.category = t.getCategory();
        r.reportedByUserId = t.getReportedByUserId();
        r.reporterName = reporterName;
        r.assignedTechnicianId = t.getAssignedTechnicianId();
        r.assignedTechnicianName = assignedTechnicianName;
        r.resourceId = t.getResourceId();
        r.contactInfo = t.getContactInfo();
        r.imageUrls = t.getImageUrls();
        r.comments = t.getComments();
        r.resolutionNote = t.getResolutionNote();
        r.createdAt = t.getCreatedAt();
        r.updatedAt = t.getUpdatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getTicketCode() { return ticketCode; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public TicketStatus getStatus() { return status; }
    public TicketPriority getPriority() { return priority; }
    public TicketCategory getCategory() { return category; }
    public String getReportedByUserId() { return reportedByUserId; }
    public String getReporterName() { return reporterName; }
    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public String getResourceId() { return resourceId; }
    public String getContactInfo() { return contactInfo; }
    public List<String> getImageUrls() { return imageUrls; }
    public List<TicketComment> getComments() { return comments; }
    public String getResolutionNote() { return resolutionNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
