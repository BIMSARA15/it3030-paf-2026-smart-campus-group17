package com.smartcampus.api.services;

import com.smartcampus.api.dto.AddCommentRequest;
import com.smartcampus.api.dto.CreateTicketRequest;
import com.smartcampus.api.exceptions.ImageLimitExceededException;
import com.smartcampus.api.exceptions.InvalidStatusTransitionException;
import com.smartcampus.api.exceptions.TicketNotFoundException;
import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.TicketComment;
import com.smartcampus.api.models.TicketStatus;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.TicketRepository;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TicketService {

    public static final int MAX_IMAGES = 3;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    public Ticket createTicket(CreateTicketRequest req, String userId) {
        if (req.getTitle() == null || req.getTitle().isBlank()) throw new IllegalArgumentException("Title is required");
        if (req.getDescription() == null || req.getDescription().isBlank()) throw new IllegalArgumentException("Description is required");
        if (req.getPriority() == null) throw new IllegalArgumentException("Priority is required");
        if (req.getImageUrls() != null && req.getImageUrls().size() > MAX_IMAGES) throw new ImageLimitExceededException(MAX_IMAGES);

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

        // FIX 1: Safely fetch technicians (Avoid strict boolean matching in MongoDB)
        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
        List<User> allTechnicians = userRepository.findByRole("TECHNICIAN");

        User chosen = null;
        long lowestWorkload = Long.MAX_VALUE;
        for (User tech : allTechnicians) {
            Boolean isAvail = tech.isAvailable();
            // Assign to least busy technician that isn't explicitly marked unavailable
            if (isAvail == null || isAvail) {
                long workload = ticketRepository.countByAssignedTechnicianIdAndStatusIn(tech.getId(), activeStatuses);
                if (workload < lowestWorkload) {
                    lowestWorkload = workload;
                    chosen = tech;
                }
            }
        }

        if (chosen != null) {
            t.setAssignedTechnicianId(chosen.getId());
            String techLabel = chosen.getName() != null && !chosen.getName().isBlank() ? chosen.getName() : chosen.getId();
            t.getComments().add(new TicketComment("SYSTEM", "SYSTEM", "Ticket auto-assigned to technician " + techLabel + "."));
        } else {
            t.getComments().add(new TicketComment("SYSTEM", "SYSTEM", "No available technician was found. Ticket was saved without assignment."));
        }

        Ticket savedTicket = ticketRepository.save(t);

        // --- FETCH REPORTER INFO ---
        User reporter = userRepository.findById(userId).orElse(null);
        String reporterName = (reporter != null && reporter.getName() != null) ? reporter.getName() : "Student";
        String reporterEmail = (reporter != null) ? reporter.getEmail() : null;

        // --- FIX 2: NOTIFICATIONS AND EMAILS FOR TECHNICIANS ---
        String techMessage = String.format("A new support ticket has been opened.\n\n👤 From: %s\n📝 Issue: %s", reporterName, savedTicket.getTitle());
        
        for (User tech : allTechnicians) {
            // 1. Send WebSocket Notification to Technician
            notificationService.sendNotification(tech.getId(), "New Support Ticket 🎫", techMessage);
            
            // 2. Send Email to Technician
            if (tech.getEmail() != null) {
                try {
                    emailService.sendTicketHtmlEmail(
                        savedTicket, 
                        tech, 
                        "ACTION REQUIRED: New Support Ticket", 
                        "ticket-created-email" 
                    );
                } catch (Exception e) {
                    System.err.println("Tech email failed: " + e.getMessage());
                }
            }
        }

        // --- FIX 3: NOTIFICATIONS AND EMAILS FOR THE STUDENT ---
        if (reporter != null) {
            // 1. Send WebSocket Notification (This was missing!)
            notificationService.sendNotification(
                reporter.getId(), 
                "Ticket Submitted ✅", 
                "Your support ticket '" + savedTicket.getTitle() + "' has been successfully submitted."
            );

            // 2. Send HTML Email
            if (reporterEmail != null) {
                try {
                    emailService.sendTicketHtmlEmail(
                        savedTicket, 
                        reporter, 
                        "Ticket Received - UniBook Smart Campus", 
                        "ticket-created-email"
                    );
                } catch (Exception e) {
                    System.err.println("Student email failed: " + e.getMessage());
                }
            }
        }

        return savedTicket;
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

    public Ticket updateTicketStatus(String id, TicketStatus newStatus, String updatedByUserId, String note) {
        if (newStatus == null) throw new IllegalArgumentException("New status is required");
        
        Ticket t = getTicketById(id);
        TicketStatus current = t.getStatus();

        Set<TicketStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new InvalidStatusTransitionException(current, newStatus);
        }

        t.setStatus(newStatus);
        t.setUpdatedAt(LocalDateTime.now());

        String systemMsg = "Status changed: " + current + " → " + newStatus + (note != null && !note.isBlank() ? " — " + note.trim() : "");
        t.getComments().add(new TicketComment(updatedByUserId, "SYSTEM", systemMsg));

        if (note != null && !note.isBlank()) {
            t.setResolutionNote(note.trim());
        }

        Ticket savedTicket = ticketRepository.save(t);

        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            User reporter = userRepository.findById(t.getReportedByUserId()).orElse(null);
            if (reporter != null) {
                String closeMessage = "Your support ticket '" + t.getTitle() + "' has been marked as " + newStatus + " by the technical team.";
                
                System.out.println("DEBUG: Sending CLOSED notification to: " + reporter.getId());
                notificationService.sendNotification(reporter.getId(), "Ticket " + newStatus + " ✅", closeMessage);

                if (reporter.getEmail() != null) {
                    try {
                        emailService.sendTicketHtmlEmail(savedTicket, reporter, "Ticket " + newStatus + " - UniBook", "ticket-status-email");
                    } catch (Exception e) {
                        System.err.println("Failed to send close email: " + e.getMessage());
                    }
                }
            }
        }

        return savedTicket;
    }

    public Ticket addComment(String ticketId, AddCommentRequest req, String authorId, String authorRole) {
        if (req.getMessage() == null || req.getMessage().isBlank()) throw new IllegalArgumentException("Comment message is required");
        
        Ticket t = getTicketById(ticketId);
        t.getComments().add(new TicketComment(authorId, authorRole, req.getMessage().trim()));
        t.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(t);

        // If a technician replies, notify the student
        if (!authorId.equals(t.getReportedByUserId())) {
            User reporter = userRepository.findById(t.getReportedByUserId()).orElse(null);
            if (reporter != null) {
                String replyMessage = String.format("A technician has replied to your ticket.\n\n🎫 Ticket: %s\n💬 Reply: %s", t.getTitle(), req.getMessage().trim());
                
                System.out.println("DEBUG: Sending REPLY notification to: " + reporter.getId());
                notificationService.sendNotification(reporter.getId(), "New Ticket Reply 💬", replyMessage);

                if (reporter.getEmail() != null) {
                    try {
                        emailService.sendTicketHtmlEmail(savedTicket, reporter, "New Reply on your Support Ticket", "ticket-reply-email");
                    } catch (Exception e) {
                        System.err.println("Failed to send reply email: " + e.getMessage());
                    }
                }
            }
        }

        return savedTicket;
    }

    public Ticket assignTechnician(String ticketId, String technicianId) {
        if (technicianId == null || technicianId.isBlank()) throw new IllegalArgumentException("Technician id is required");
        Ticket t = getTicketById(ticketId);
        t.setAssignedTechnicianId(technicianId);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    public Ticket uploadImages(String ticketId, List<String> imageUrls) {
        if (imageUrls == null) throw new IllegalArgumentException("imageUrls is required");
        Ticket t = getTicketById(ticketId);
        List<String> merged = new ArrayList<>(t.getImageUrls());
        merged.addAll(imageUrls);
        if (merged.size() > MAX_IMAGES) throw new ImageLimitExceededException(MAX_IMAGES);
        t.setImageUrls(merged);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) throw new TicketNotFoundException(id);
        ticketRepository.deleteById(id);
    }

    private String nextTicketCode() {
        long seq = ticketRepository.count() + 1;
        return String.format("TKT-%03d", seq);
    }
}