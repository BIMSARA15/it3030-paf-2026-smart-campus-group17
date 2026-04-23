package com.smartcampus.api.services;

import com.smartcampus.api.dto.AddCommentRequest;
import com.smartcampus.api.dto.CreateTicketRequest;
import com.smartcampus.api.exceptions.ImageLimitExceededException;
import com.smartcampus.api.exceptions.InvalidStatusTransitionException;
import com.smartcampus.api.exceptions.TicketNotFoundException;
import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.TicketComment;
import com.smartcampus.api.models.TicketStatus;
import com.smartcampus.api.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// --- ADDED FOR AUTO-ASSIGNMENT ---
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import java.util.stream.Collectors;
// --- END ADDED CODE ---

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Business logic for the maintenance ticketing module.
 *
 * Responsibilities:
 * - validate the ticket status lifecycle (see ALLOWED_TRANSITIONS)
 * - cap embedded image URLs at MAX_IMAGES
 * - keep updatedAt fresh on any mutation
 * - append comments / system notes to the embedded list
 * - generate a sequential ticketCode (TKT-001, TKT-002, ...)
 */
@Service
public class TicketService {

    public static final int MAX_IMAGES = 3;

    /**
     * The forward-only lifecycle. Spec requires OPEN -> IN_PROGRESS -> RESOLVED;
     * Figma surfaces REJECTED + CLOSED filters so we permit those terminations too.
     */
    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(TicketStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(TicketStatus.OPEN,        Set.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(TicketStatus.IN_PROGRESS, Set.of(TicketStatus.RESOLVED,    TicketStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(TicketStatus.RESOLVED,    Set.of(TicketStatus.CLOSED));
        ALLOWED_TRANSITIONS.put(TicketStatus.REJECTED,    Set.of());
        ALLOWED_TRANSITIONS.put(TicketStatus.CLOSED,      Set.of());
    }

    @Autowired
    private TicketRepository ticketRepository;

    // --- ADDED FOR AUTO-ASSIGNMENT ---
    @Autowired
    private UserRepository userRepository;
    // --- END ADDED CODE ---

    public Ticket createTicket(CreateTicketRequest req, String userId) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (req.getDescription() == null || req.getDescription().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (req.getPriority() == null) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (req.getImageUrls() != null && req.getImageUrls().size() > MAX_IMAGES) {
            throw new ImageLimitExceededException(MAX_IMAGES);
        }

        Ticket t = new Ticket();
        t.setTitle(req.getTitle().trim());
        t.setDescription(req.getDescription().trim());
        t.setPriority(req.getPriority());
        t.setCategory(req.getCategory());
        t.setStatus(TicketStatus.OPEN);
        t.setReportedByUserId(userId);
        t.setResourceId(req.getResourceId());
        t.setContactInfo(req.getContactInfo());
        t.setImageUrls(req.getImageUrls() != null ? new ArrayList<>(req.getImageUrls()) : new ArrayList<>());
        t.setComments(new ArrayList<>());
        LocalDateTime now = LocalDateTime.now();
        t.setCreatedAt(now);
        t.setUpdatedAt(now);
        t.setTicketCode(nextTicketCode());

        // --- ADDED FOR AUTO-ASSIGNMENT ---
        // 1. Fetch all available technicians
        List<User> availableTechnicians = userRepository.findByRole("TECHNICIAN").stream()
                .filter(User::isAvailable)
                .collect(Collectors.toList());

        if (!availableTechnicians.isEmpty()) {
            User leastLoadedTech = null;
            long minLoad = Long.MAX_VALUE;

            // We calculate workload based on OPEN and IN_PROGRESS tickets
            List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

            // 2. Find the technician with the least active tickets
            for (User tech : availableTechnicians) {
                long currentLoad = ticketRepository.countByAssignedTechnicianIdAndStatusIn(tech.getId(), activeStatuses);
                
                if (currentLoad < minLoad) {
                    minLoad = currentLoad;
                    leastLoadedTech = tech;
                }
            }

            // 3. Assign the ticket and leave a system trace comment
            if (leastLoadedTech != null) {
                t.setAssignedTechnicianId(leastLoadedTech.getId());
                String systemMsg = "Ticket auto-assigned to available technician based on workload.";
                t.getComments().add(new TicketComment("SYSTEM", "SYSTEM", systemMsg));
            }
        }
        // --- END ADDED CODE ---

        return ticketRepository.save(t);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByReportedByUserId(userId);
    }

    public List<Ticket> getTicketsByTechnician(String techId) {
        return ticketRepository.findByAssignedTechnicianId(techId);
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public long countTechnicianTicketsByStatus(String techId, TicketStatus status) {
        return ticketRepository.countByAssignedTechnicianIdAndStatus(techId, status);
    }

    /**
     * Move a ticket to a new status iff (current -> new) is in ALLOWED_TRANSITIONS.
     * Records the change as an auto-generated SYSTEM comment so the timeline is auditable.
     * If `note` is non-blank, also stores it as the ticket's resolutionNote.
     */
    public Ticket updateTicketStatus(String id, TicketStatus newStatus, String updatedByUserId, String note) {
        if (newStatus == null) {
            throw new IllegalArgumentException("New status is required");
        }
        Ticket t = getTicketById(id);
        TicketStatus current = t.getStatus();

        Set<TicketStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new InvalidStatusTransitionException(current, newStatus);
        }

        t.setStatus(newStatus);
        t.setUpdatedAt(LocalDateTime.now());

        String systemMsg = "Status changed: " + current + " → " + newStatus
                + (note != null && !note.isBlank() ? " — " + note.trim() : "");
        t.getComments().add(new TicketComment(updatedByUserId, "SYSTEM", systemMsg));

        if (note != null && !note.isBlank()) {
            t.setResolutionNote(note.trim());
        }

        return ticketRepository.save(t);
    }

    public Ticket addComment(String ticketId, AddCommentRequest req, String authorId, String authorRole) {
        if (req.getMessage() == null || req.getMessage().isBlank()) {
            throw new IllegalArgumentException("Comment message is required");
        }
        Ticket t = getTicketById(ticketId);
        t.getComments().add(new TicketComment(authorId, authorRole, req.getMessage().trim()));
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    public Ticket assignTechnician(String ticketId, String technicianId) {
        if (technicianId == null || technicianId.isBlank()) {
            throw new IllegalArgumentException("Technician id is required");
        }
        Ticket t = getTicketById(ticketId);
        t.setAssignedTechnicianId(technicianId);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    /**
     * Merges new image URLs into the existing list.
     * Throws ImageLimitExceededException if the resulting total exceeds MAX_IMAGES.
     */
    public Ticket uploadImages(String ticketId, List<String> imageUrls) {
        if (imageUrls == null) {
            throw new IllegalArgumentException("imageUrls is required");
        }
        Ticket t = getTicketById(ticketId);
        List<String> merged = new ArrayList<>(t.getImageUrls());
        merged.addAll(imageUrls);
        if (merged.size() > MAX_IMAGES) {
            throw new ImageLimitExceededException(MAX_IMAGES);
        }
        t.setImageUrls(merged);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new TicketNotFoundException(id);
        }
        ticketRepository.deleteById(id);
    }

    /** "TKT-" + zero-padded sequential count (TKT-001, TKT-002, ...). */
    private String nextTicketCode() {
        long seq = ticketRepository.count() + 1;
        return String.format("TKT-%03d", seq);
    }
}