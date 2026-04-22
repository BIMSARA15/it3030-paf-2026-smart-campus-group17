package com.smartcampus.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the URL React will connect to
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Allow your React app
                .withSockJS(); // Fallback for older browsers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Set up a mini message broker in memory
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}