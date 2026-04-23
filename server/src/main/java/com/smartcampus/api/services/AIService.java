package com.smartcampus.api.services;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;

@Service
public class AIService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // This points to your Python FastAPI server running on port 8000
    private final String PYTHON_API_URL = "http://localhost:8000/chat";

    public String askAI(String userId, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Map the payload exactly as the Python Pydantic model expects
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("user_id", userId);
        requestBody.put("message", userMessage);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            // Send the POST request to Python
            @SuppressWarnings("unchecked")
            Map<String, String> response = restTemplate.postForObject(PYTHON_API_URL, request, Map.class);
            
            if (response != null && response.containsKey("reply")) {
                return response.get("reply");
            }
            return "Error: Did not receive a valid reply from the AI.";
            
        } catch (Exception e) {
            System.err.println("AI Connection Error: " + e.getMessage());
            throw new RuntimeException("Could not connect to the Python AI Microservice. Is it running on port 8000?");
        }
    }
}