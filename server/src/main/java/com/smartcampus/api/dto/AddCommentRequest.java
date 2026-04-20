package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotBlank;

/** Payload for POST /api/tickets/{id}/comments. */
public class AddCommentRequest {

    @NotBlank(message = "Message is required")
    private String message;

    public AddCommentRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
