package com.smartcampus.api.exceptions;

/** Thrown when a ticket lookup by id returns no document. Mapped to HTTP 404. */
public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String id) {
        super("Ticket not found: " + id);
    }
}
