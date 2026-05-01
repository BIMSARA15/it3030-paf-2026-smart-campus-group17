package com.smartcampus.api.controllers;

import com.smartcampus.api.models.Resource;
import com.smartcampus.api.repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        List<Resource> resources = resourceRepository.findAll();
        resources.sort(Comparator.comparing(Resource::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return resources;
    }

    @PostMapping
    public ResponseEntity<?> createResource(@RequestBody Resource resource) {
        if (!isValid(resource)) {
            return ResponseEntity.badRequest().body("Missing required resource fields.");
        }

        sanitize(resource);

        LocalDateTime now = LocalDateTime.now();
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);

        return ResponseEntity.ok(resourceRepository.save(resource));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateResource(@PathVariable String id, @RequestBody Resource updateData) {
        if (!isValid(updateData)) {
            return ResponseEntity.badRequest().body("Missing required resource fields.");
        }

        return resourceRepository.findById(id)
            .<ResponseEntity<?>>map(existing -> {
                existing.setResourceCode(updateData.getResourceCode());
                existing.setResourceName(updateData.getResourceName());
                existing.setBlock(updateData.getBlock());
                existing.setLevel(updateData.getLevel());
                existing.setCapacity(updateData.getCapacity());
                existing.setType(updateData.getType());
                existing.setFeatures(updateData.getFeatures());
                if (updateData.getUtilityIds() != null) {
                    existing.setUtilityIds(updateData.getUtilityIds());
                }
                existing.setStatus(updateData.getStatus());
                existing.setAccess(updateData.getAccess());
                existing.setDescription(updateData.getDescription());

                sanitize(existing);
                existing.setUpdatedAt(LocalDateTime.now());

                return ResponseEntity.ok(resourceRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        if (!resourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isValid(Resource resource) {
        return !isBlank(resource.getResourceCode()) &&
            !isBlank(resource.getResourceName()) &&
            !isBlank(resource.getBlock()) &&
            !isBlank(resource.getLevel()) &&
            resource.getCapacity() != null &&
            resource.getCapacity() > 0 &&
            !isBlank(resource.getType()) &&
            !isBlank(resource.getStatus()) &&
            !isBlank(resource.getAccess());
    }

    private void sanitize(Resource resource) {
        resource.setResourceCode(resource.getResourceCode().trim().toUpperCase());
        resource.setResourceName(resource.getResourceName().trim());
        resource.setBlock(resource.getBlock().trim());
        resource.setLevel(resource.getLevel().trim());
        resource.setType(resource.getType().trim());
        resource.setStatus(resource.getStatus().trim());
        resource.setAccess(canonicalizeAccess(resource.getAccess()));
        resource.setDescription(resource.getDescription() == null ? "" : resource.getDescription().trim());
        resource.setFeatures(resource.getFeatures() == null ? new ArrayList<>() : resource.getFeatures());
        resource.setUtilityIds(resource.getUtilityIds() == null ? new ArrayList<>() : resource.getUtilityIds());
    }

    private String canonicalizeAccess(String access) {
        String normalized = access == null ? "" : access.trim().toLowerCase();
        if (normalized.contains("lecturer")) return "Lecturer";
        if (normalized.contains("student")) return "Student";
        if (normalized.contains("anyone") || normalized.contains("open") || normalized.contains("all")) return "Anyone";
        return access == null ? "" : access.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
