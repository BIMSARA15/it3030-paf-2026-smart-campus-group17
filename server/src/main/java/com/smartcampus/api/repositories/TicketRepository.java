package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Ticket;
import com.smartcampus.api.models.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * Spring Data repository for Ticket documents.
 * Uses the standard `findBy...` naming convention so Spring auto-generates
 * the underlying MongoDB queries — no manual @Query needed.
 */
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedTechnicianId(String techId);

    List<Ticket> findByReportedByUserId(String userId);

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    /** Powers the "5 open maintenance tickets" KPI on the Technician dashboard. */
    long countByAssignedTechnicianIdAndStatus(String techId, TicketStatus status);
}
