package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import com.smartcampus.api.services.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "${app.frontend.url}", allowCredentials = "true")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private UserRepository userRepository;

    private String extractUserIdSafe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Object principal = authentication.getPrincipal();
        String userId = null;
        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            userId = oauth2User.getAttribute("id");
            if (userId == null) {
                String email = oauth2User.getAttribute("email");
                if (email != null) {
                    Optional<User> dbUser = userRepository.findByEmail(email);
                    if (dbUser.isPresent()) userId = dbUser.get().getId();
                }
            }
        }
        if (userId == null) userId = authentication.getName();
        return userId;
    }

  @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(@RequestBody Map<String, Object> payload, Authentication authentication) {
        String userId = extractUserIdSafe(authentication);
        if (userId == null || userId.equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "You must be logged in to use the AI Assistant."));
        }

        // --- NEW: Fetch the full user details from the database! ---
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "User account not found."));
        }
        User currentUser = userOpt.get();
        // -----------------------------------------------------------

        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");

        if (history == null || history.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chat history cannot be empty."));
        }

        try {
            // Pass the FULL USER OBJECT instead of just the ID
            String aiReply = aiService.askAI(currentUser, history);
            return ResponseEntity.ok(Map.of("reply", aiReply));
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "AI Service is currently offline."));
        }
    }
}