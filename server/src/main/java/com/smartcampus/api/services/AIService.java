package com.smartcampus.api.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import com.smartcampus.api.models.User;
import java.util.HashMap;
import java.util.List;

@Service
public class AIService {
    
    // Pull the URL and Token from application.properties
    @Value("${ai.microservice.url}")
    private String aiServiceUrl;

    @Value("${ai.microservice.token}")
    private String aiToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askAI(User user, List<Map<String, String>> history) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // --- SECURITY SETUP: Attach the token to the header ---
        headers.set("Authorization", "Bearer " + aiToken);

        Map<String, Object> requestBody = new HashMap<>();
        // Send the secure details to Python
        requestBody.put("user_id", user.getId());
        requestBody.put("user_name", user.getName() != null ? user.getName() : "Campus User");
        requestBody.put("user_email", user.getEmail() != null ? user.getEmail() : "no-email@smartcampus.com");
        requestBody.put("history", history); 

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            // Use the dynamic aiServiceUrl instead of the hardcoded one
            Map<String, String> response = restTemplate.postForObject(aiServiceUrl, request, Map.class);
            
            if (response != null && response.containsKey("reply")) {
                return response.get("reply");
            }
            return "Error: Did not receive a valid reply from the AI.";
            
        } catch (Exception e) {
            System.err.println("AI Connection Error: " + e.getMessage());
            throw new RuntimeException("Could not connect to AI microservice.");
        }
    }
}