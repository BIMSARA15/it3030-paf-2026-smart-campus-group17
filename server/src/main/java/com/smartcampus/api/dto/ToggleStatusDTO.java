package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotNull;

public class ToggleStatusDTO {
    @NotNull(message = "Availability status is required")
    private Boolean available;

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}