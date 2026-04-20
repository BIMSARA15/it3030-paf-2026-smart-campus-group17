package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Utility;
import com.smartcampus.api.repositories.UtilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/utilities")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UtilityController {

    @Autowired
    private UtilityRepository utilityRepository;

    @GetMapping
    public List<Utility> getAllUtilities() {
        List<Utility> utilities = utilityRepository.findAll();
        utilities.sort(Comparator.comparing(Utility::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return utilities;
    }

    @PostMapping
    public ResponseEntity<?> createUtility(@RequestBody Utility utility) {
        if (!isValid(utility)) {
            return ResponseEntity.badRequest().body("Missing required utility fields.");
        }

        sanitize(utility);
        LocalDateTime now = LocalDateTime.now();
        utility.setCreatedAt(now);
        utility.setUpdatedAt(now);

        return ResponseEntity.ok(utilityRepository.save(utility));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUtility(@PathVariable String id, @RequestBody Utility updateData) {
        if (!isValid(updateData)) {
            return ResponseEntity.badRequest().body("Missing required utility fields.");
        }

        return utilityRepository.findById(id)
            .<ResponseEntity<?>>map(existing -> {
                existing.setUtilityCode(updateData.getUtilityCode());
                existing.setUtilityName(updateData.getUtilityName());
                existing.setCategory(updateData.getCategory());
                existing.setQuantity(updateData.getQuantity());
                existing.setStatus(updateData.getStatus());
                existing.setLocation(updateData.getLocation());
                existing.setDescription(updateData.getDescription());

                sanitize(existing);
                existing.setUpdatedAt(LocalDateTime.now());

                return ResponseEntity.ok(utilityRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtility(@PathVariable String id) {
        if (!utilityRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        utilityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isValid(Utility utility) {
        return !isBlank(utility.getUtilityCode()) &&
            !isBlank(utility.getUtilityName()) &&
            !isBlank(utility.getCategory()) &&
            utility.getQuantity() != null &&
            utility.getQuantity() > 0 &&
            !isBlank(utility.getStatus()) &&
            !isBlank(utility.getLocation());
    }

    private void sanitize(Utility utility) {
        utility.setUtilityCode(utility.getUtilityCode().trim().toUpperCase());
        utility.setUtilityName(utility.getUtilityName().trim());
        utility.setCategory(utility.getCategory().trim());
        utility.setStatus(utility.getStatus().trim());
        utility.setLocation(utility.getLocation().trim());
        utility.setDescription(utility.getDescription() == null ? "" : utility.getDescription().trim());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
