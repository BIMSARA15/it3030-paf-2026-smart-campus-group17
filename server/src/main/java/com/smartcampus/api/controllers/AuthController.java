package com.smartcampus.api.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUser(@AuthenticationPrincipal OAuth2User principal) {
        // If the user is not logged in, the principal will be null.
        if (principal == null) {
            // Return a 401 Unauthorized status instead of crashing
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Returns the JSON payload from Google (name, email, picture, etc.)
        return ResponseEntity.ok(principal.getAttributes());
    }
}