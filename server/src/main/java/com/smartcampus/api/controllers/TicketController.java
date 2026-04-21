package com.smartcampus.api.controllers;

import com.smartcampus.api.dto.AddCommentRequest;
import com.smartcampus.api.dto.AssignTechnicianRequest;
import com.smartcampus.api.dto.CreateTicketRequest;
import com.smartcampus.api.dto.TicketResponse;
import com.smartcampus.api.dto.UpdateStatusRequest;
import com.smartcampus.api.dto.UploadImagesRequest;
import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST endpoints for Module C — Maintenance & Incident Ticketing.
 *
 * Security model:
 *  - All /api/tickets/** routes are gated by SecurityConfig (authenticated users only).
 *  - The "current user" is resolved from the Spring Security Authentication,
 *    so this works for both manual-login and OAuth2 sessions.
 *  - ADMIN-only endpoints (GET /, DELETE /{id}) check the role inline and
 *    return 403 otherwise.
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired private TicketService ticketService;
    @Autowired private UserRepository userRepository;

    // ----------------------------------------------------------------------
    // CRUD
    // ----------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest req,
                                                       Authentication authentication) {
        User me = currentUserOrThrow(authentication);
        Ticket created = ticketService.createTicket(req, me.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    /** Admin-only: list every ticket in the system, newest first. */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(Authentication authentication) {
        User me = currentUserOrThrow(authentication);
        requireRole(me, "ADMIN");
        return ResponseEntity.ok(toResponses(ticketService.getAllTickets()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(toResponse(ticketService.getTicketById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(toResponses(ticketService.getTicketsByUser(userId)));
    }

    @GetMapping("/technician/{techId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByTechnician(@PathVariable String techId) {
        return ResponseEntity.ok(toResponses(ticketService.getTicketsByTechnician(techId)));
    }

    // ----------------------------------------------------------------------
    // Status / Assignment / Comments / Images
    // ----------------------------------------------------------------------

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable String id,
                                                       @Valid @RequestBody UpdateStatusRequest req,
                                                       Authentication authentication) {
        User me = currentUserOrThrow(authentication);
        Ticket updated = ticketService.updateTicketStatus(id, req.getStatus(), me.getId(), req.getNote());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketResponse> addComment(@PathVariable String id,
                                                     @Valid @RequestBody AddCommentRequest req,
                                                     Authentication authentication) {
        User me = currentUserOrThrow(authentication);
        Ticket updated = ticketService.addComment(id, req, me.getId(), me.getRole());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(@PathVariable String id,
                                                           @Valid @RequestBody AssignTechnicianRequest req) {
        Ticket updated = ticketService.assignTechnician(id, req.getTechnicianId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<TicketResponse> uploadImages(@PathVariable String id,
                                                       @Valid @RequestBody UploadImagesRequest req) {
        Ticket updated = ticketService.uploadImages(id, req.getImageUrls());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id, Authentication authentication) {
        User me = currentUserOrThrow(authentication);
        requireRole(me, "ADMIN");
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    /**
     * Build a TicketResponse with reporter + technician display names resolved
     * via the UserRepository. Falls back to id-suffix if the user can't be found.
     */
    private TicketResponse toResponse(Ticket t) {
        return TicketResponse.from(t,
                lookupName(t.getReportedByUserId()),
                lookupName(t.getAssignedTechnicianId()));
    }

    /**
     * Bulk variant that batches the user lookup so a list of N tickets only
     * incurs one repo round-trip per *unique* user id.
     */
    private List<TicketResponse> toResponses(List<Ticket> tickets) {
        Map<String, String> nameCache = new HashMap<>();
        return tickets.stream().map(t -> TicketResponse.from(t,
                cachedName(t.getReportedByUserId(), nameCache),
                cachedName(t.getAssignedTechnicianId(), nameCache))).toList();
    }

    private String cachedName(String userId, Map<String, String> cache) {
        if (userId == null) return null;
        return cache.computeIfAbsent(userId, this::lookupName);
    }

    private String lookupName(String userId) {
        if (userId == null) return null;
        return userRepository.findById(userId).map(User::getName).orElse(null);
    }

    /**
     * Resolve the logged-in user (works for both manual login and OAuth2)
     * and load the persistent User record so we have a stable Mongo `id`.
     */
    private User currentUserOrThrow(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String email;
        if (authentication.getPrincipal() instanceof OAuth2User oauth) {
            email = oauth.getAttribute("email");
        } else {
            email = authentication.getName();
        }
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return u.get();
    }

    private void requireRole(User user, String role) {
        if (user.getRole() == null || !user.getRole().equalsIgnoreCase(role)) {
            throw new AccessDeniedException("Requires role: " + role);
        }
    }
}
