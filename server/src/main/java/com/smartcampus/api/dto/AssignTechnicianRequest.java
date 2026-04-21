package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotBlank;

/** Payload for PATCH /api/tickets/{id}/assign. */
public class AssignTechnicianRequest {

    @NotBlank(message = "Technician id is required")
    private String technicianId;

    public AssignTechnicianRequest() {}

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }
}
