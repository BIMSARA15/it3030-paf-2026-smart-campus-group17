package com.smartcampus.api.exceptions;

import com.smartcampus.api.models.TicketStatus;

/**
 * Thrown when a ticket status transition is not part of the allowed
 * lifecycle (see TicketService.ALLOWED_TRANSITIONS). Mapped to HTTP 400.
 */
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(TicketStatus from, TicketStatus to) {
        super("Invalid status transition: " + from + " -> " + to);
    }
}
