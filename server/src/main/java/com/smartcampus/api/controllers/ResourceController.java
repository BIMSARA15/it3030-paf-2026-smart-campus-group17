package com.smartcampus.api.controllers;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.api.models.Resource;
import com.smartcampus.api.repositories.ResourceRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public List<Resource> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status) {
        String normalizedLocation = normalize(location);

        return resourceRepository.findAll().stream()
                .filter(resource -> isBlank(type) || equalsIgnoreCase(resource.getType(), type))
                .filter(resource -> isBlank(status) || equalsIgnoreCase(resource.getStatus(), status))
                .filter(resource -> normalizedLocation == null
                        || containsIgnoreCase(resource.getLocation(), normalizedLocation)
                        || containsIgnoreCase(resource.getBuilding(), normalizedLocation))
                .filter(resource -> minCapacity == null || safeInt(resource.getCapacity()) >= minCapacity)
                .sorted(Comparator.comparing(Resource::getUpdatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Resource createResource(@Valid @RequestBody Resource resource) {
        String resourceCode = normalizeRequired(resource.getResourceCode(), "Resource code is required.");

        resourceRepository.findByResourceCodeIgnoreCase(resourceCode).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A resource with this code already exists.");
        });

        Instant now = Instant.now();
        resource.setId(null);
        resource.setName(normalizeRequired(resource.getName(), "Resource name is required."));
        resource.setResourceCode(resourceCode);
        resource.setType(defaultValue(resource.getType(), "LECTURE_HALL"));
        resource.setCapacity(Math.max(safeInt(resource.getCapacity()), 0));
        resource.setLocation(normalizeOptional(resource.getLocation()));
        resource.setBuilding(normalizeOptional(resource.getBuilding()));
        resource.setFloor(normalizeOptional(resource.getFloor()));
        resource.setRequesterType(defaultValue(resource.getRequesterType(), "LECTURER"));
        resource.setStatus(defaultValue(resource.getStatus(), "ACTIVE"));
        resource.setDescription(normalizeOptional(resource.getDescription()));
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);

        return resourceRepository.save(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable String id, @Valid @RequestBody Resource resource) {
        Resource existingResource = getResourceById(id);
        String resourceCode = normalizeRequired(resource.getResourceCode(), "Resource code is required.");

        resourceRepository.findByResourceCodeIgnoreCase(resourceCode)
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A resource with this code already exists.");
                });

        existingResource.setName(normalizeRequired(resource.getName(), "Resource name is required."));
        existingResource.setResourceCode(resourceCode);
        existingResource.setType(defaultValue(resource.getType(), "LECTURE_HALL"));
        existingResource.setCapacity(Math.max(safeInt(resource.getCapacity()), 0));
        existingResource.setLocation(normalizeOptional(resource.getLocation()));
        existingResource.setBuilding(normalizeOptional(resource.getBuilding()));
        existingResource.setFloor(normalizeOptional(resource.getFloor()));
        existingResource.setRequesterType(defaultValue(resource.getRequesterType(), "LECTURER"));
        existingResource.setStatus(defaultValue(resource.getStatus(), "ACTIVE"));
        existingResource.setDescription(normalizeOptional(resource.getDescription()));
        existingResource.setUpdatedAt(Instant.now());

        return resourceRepository.save(existingResource);
    }

    @PatchMapping("/{id}/status")
    public Resource patchResourceStatus(@PathVariable String id, @RequestParam String status) {
        Resource resource = getResourceById(id);
        resource.setStatus(defaultValue(status, "ACTIVE"));
        resource.setUpdatedAt(Instant.now());
        return resourceRepository.save(resource);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> deleteResource(@PathVariable String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
        return Map.of("success", true);
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String normalize(String value) {
        return isBlank(value) ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private static String normalizeRequired(String value, String message) {
        if (isBlank(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private static String defaultValue(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private static boolean equalsIgnoreCase(String left, String right) {
        return left != null && left.equalsIgnoreCase(right);
    }

    private static boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private static int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}
