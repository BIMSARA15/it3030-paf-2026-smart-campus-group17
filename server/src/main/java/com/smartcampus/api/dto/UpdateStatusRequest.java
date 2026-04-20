package com.smartcampus.api.dto;

import com.smartcampus.api.models.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for PATCH /api/tickets/{id}/status.
 * `note` is optional — when present it is appended as a SYSTEM comment
 * AND saved as the ticket's resolutionNote.
 */
public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String note;

    public UpdateStatusRequest() {}

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
