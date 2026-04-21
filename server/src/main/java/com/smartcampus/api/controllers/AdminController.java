package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // 1. GET ALL TECHNICIANS
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getAllTechnicians() {
        List<User> technicians = userRepository.findByRole("TECHNICIAN");
        return ResponseEntity.ok(technicians);
    }

    // 2. PROVISION NEW TECHNICIAN
    @PreAuthorize("hasRole('ADMIN')") 
    @PostMapping("/provision-technician")
    public ResponseEntity<?> createTechnician(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String phoneNumber = request.get("phoneNumber"); // 👈 Capture the phone number

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Error: Email is required.");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Error: This email is already registered in the system.");
        }

        User technician = new User();
        technician.setEmail(email);
        technician.setName(name != null && !name.isBlank() ? name : email.split("@")[0]);
        technician.setPhoneNumber(phoneNumber); // 👈 Save the phone number
        technician.setRole("TECHNICIAN");

        userRepository.save(technician);
        
        return ResponseEntity.ok("Technician successfully provisioned.");
    }
}