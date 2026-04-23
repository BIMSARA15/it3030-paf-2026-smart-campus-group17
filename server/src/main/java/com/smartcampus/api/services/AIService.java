package com.smartcampus.api.services;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class AIService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_API_URL = "http://localhost:8000/chat";

    // 👈 FIX: Accept the List of history
    public String askAI(String userId, List<Map<String, String>> history) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 👈 FIX: Use Map<String, Object> to allow the array
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("user_id", userId);
        requestBody.put("history", history); 

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, String> response = restTemplate.postForObject(PYTHON_API_URL, request, Map.class);
            
            if (response != null && response.containsKey("reply")) {
                return response.get("reply");
            }
            return "Error: Did not receive a valid reply from the AI.";
            
        } catch (Exception e) {
            System.err.println("AI Connection Error: " + e.getMessage());
            throw new RuntimeException("Could not connect to the Python AI Microservice.");
        }
    }
}