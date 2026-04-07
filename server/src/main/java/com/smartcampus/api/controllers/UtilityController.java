package com.smartcampus.api.controllers;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.api.models.Utility;
import com.smartcampus.api.repositories.UtilityRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utilities")
public class UtilityController {

    private final UtilityRepository utilityRepository;

    public UtilityController(UtilityRepository utilityRepository) {
        this.utilityRepository = utilityRepository;
    }

    @GetMapping
    public List<Utility> getUtilities(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedLocation,
            @RequestParam(required = false) String status) {
        String normalizedLocation = normalize(assignedLocation);

        return utilityRepository.findAll().stream()
                .filter(utility -> isBlank(category) || equalsIgnoreCase(utility.getCategory(), category))
                .filter(utility -> isBlank(status) || equalsIgnoreCase(utility.getStatus(), status))
                .filter(utility -> normalizedLocation == null
                        || containsIgnoreCase(utility.getAssignedLocation(), normalizedLocation))
                .sorted(Comparator.comparing(Utility::getUpdatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Utility createUtility(@Valid @RequestBody Utility utility) {
        String utilityCode = normalizeRequired(utility.getUtilityCode(), "Utility code is required.");

        utilityRepository.findByUtilityCodeIgnoreCase(utilityCode).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A utility with this code already exists.");
        });

        Instant now = Instant.now();
        utility.setId(null);
        utility.setName(normalizeRequired(utility.getName(), "Utility name is required."));
        utility.setUtilityCode(utilityCode);
        utility.setCategory(defaultValue(utility.getCategory(), "PROJECTOR"));
        utility.setAssignedLocation(normalizeOptional(utility.getAssignedLocation()));
        utility.setQuantity(Math.max(utility.getQuantity() == null ? 1 : utility.getQuantity(), 1));
        utility.setStatus(defaultValue(utility.getStatus(), "ACTIVE"));
        utility.setDescription(normalizeOptional(utility.getDescription()));
        utility.setCreatedAt(now);
        utility.setUpdatedAt(now);

        return utilityRepository.save(utility);
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
}
