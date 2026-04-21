package com.smartcampus.api.models;

/**
 * Severity / urgency of a ticket. Used for sorting and UI badges.
 * CRITICAL is reserved for safety / blocking issues (matches Figma).
 */
public enum TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
