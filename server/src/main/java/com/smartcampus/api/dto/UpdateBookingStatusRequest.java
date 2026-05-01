package com.smartcampus.api.dto;

public class UpdateBookingStatusRequest {
    private String status;
    private String adminNote;
    private String rejectionReason;
    private String reviewedBy;
    private String cancellationReason;
    private String requesterRole;

    // --- GETTERS AND SETTERS ---
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getRequesterRole() { return requesterRole; }
    public void setRequesterRole(String requesterRole) { this.requesterRole = requesterRole; }
}
