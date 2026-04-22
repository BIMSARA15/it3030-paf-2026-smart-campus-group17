package com.smartcampus.api.controllers;

import com.smartcampus.api.dto.ProvisionTechnicianDTO;
import com.smartcampus.api.dto.ToggleStatusDTO;
import com.smartcampus.api.models.User;
import com.smartcampus.api.services.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // ==========================================
    // 1. INJECT YOUR NEW SERVICE
    // ==========================================
    @Autowired
    private AdminService adminService; 

    // ==========================================
    // 2. YOUR TEAMMATES' EXISTING CODE
    // (If they added any other endpoints here, leave them intact below!)
    // ==========================================
    
    // ... Any of their @GetMapping or @PostMapping methods stay right here ...

    // ==========================================
    // 3. YOUR REFACTORED TECHNICIAN ENDPOINTS
    // ==========================================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getAllTechnicians() {
        return ResponseEntity.ok(adminService.getAllTechnicians());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/provision-technician")
    public ResponseEntity<?> createTechnician(@Valid @RequestBody ProvisionTechnicianDTO request) {
        adminService.provisionTechnician(request);
        return ResponseEntity.ok("Technician successfully provisioned.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/technicians/{id}/status")
    public ResponseEntity<?> toggleTechnicianStatus(@PathVariable String id, @Valid @RequestBody ToggleStatusDTO request) {
        adminService.toggleTechnicianStatus(id, request.getAvailable());
        return ResponseEntity.ok("Technician status updated.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/technicians/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable String id) {
        adminService.deleteTechnician(id);
        return ResponseEntity.ok("Technician successfully removed from the system.");
    }
}