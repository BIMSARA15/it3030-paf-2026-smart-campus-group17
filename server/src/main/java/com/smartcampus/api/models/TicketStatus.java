package com.smartcampus.api.models;

/**
 * Lifecycle states of a maintenance ticket.
 *
 * The spec only requires OPEN -> IN_PROGRESS -> RESOLVED, but the Figma
 * surfaces REJECTED and CLOSED filters too — so the enum carries them and
 * TicketService allows the extra transitions:
 *
 *   OPEN        -> IN_PROGRESS | REJECTED
 *   IN_PROGRESS -> RESOLVED    | REJECTED
 *   RESOLVED    -> CLOSED
 */
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    REJECTED,
    CLOSED
}
