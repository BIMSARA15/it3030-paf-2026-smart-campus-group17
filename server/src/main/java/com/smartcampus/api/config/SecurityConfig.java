package com.smartcampus.api.config;

// 1. ADD THESE TWO IMPORTS:
import com.smartcampus.api.services.CustomOAuth2UserService; 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // 2. INJECT THE SERVICE HERE (Inside the class, before the methods)
    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) 
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
               .requestMatchers("/", "/error", "/api/auth/dev-login/**", "/api/auth/user").permitAll()
               .requestMatchers(HttpMethod.GET, "/api/resources").permitAll()
               .requestMatchers(HttpMethod.GET, "/api/utilities").permitAll()
               .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
               .requestMatchers("/api/ai/**").authenticated()
               .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                   .oidcUserService(customOAuth2UserService)
                )
                .defaultSuccessUrl("http://localhost:5173/", true)
            );

        return http.build();
    }

   // Define the CORS rules
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow your Vite React app's URL
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // ADD "PATCH" TO THIS LIST!
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // This is crucial: it allows the browser to send the session cookie back to Spring Boot
        configuration.setAllowCredentials(true); 
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
