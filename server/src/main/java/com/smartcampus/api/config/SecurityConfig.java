package com.smartcampus.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Temporarily disable CSRF for Postman testing
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error").permitAll() // Public routes
                .anyRequest().authenticated() // Secure everything else
            )
            .oauth2Login(Customizer.withDefaults()); // Enable Google Login

        return http.build();
    }
}