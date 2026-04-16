package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// IMPORTANT: This prevents this backdoor from running in production
@Profile("!prod") 
public class DevAuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dev-login/{role}")
    public ResponseEntity<?> devQuickLogin(@PathVariable String role, HttpServletRequest request) {
        
        String roleName = role.toUpperCase();
        String email = "dev-" + role.toLowerCase() + "@smartcampus.edu";
        String name = "Dev " + roleName;

        // --- NEW: Ensure this mock user actually exists in MongoDB with the CORRECT role! ---
        if (userRepository.findByEmail(email).isEmpty()) {
            User mockUser = new User();
            mockUser.setEmail(email);
            mockUser.setName(name);
            mockUser.setRole(roleName); // This now correctly sets STUDENT, ADMIN, etc.
            mockUser.setFaculty("Computing"); // Fake data so React doesn't force us to the complete-profile page
            mockUser.setPhoneNumber("+94000000000"); 
            
            // We give it a dummy password so it doesn't break the new manual login logic
            mockUser.setPassword("dummy_dev_password"); 
            userRepository.save(mockUser);
        }

        // 1. Create fake authorities based on the requested role
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

        // 2. Create fake user attributes to mimic Microsoft/Google
        Map<String, Object> attributes = Map.of(
            "email", email,
            "name", name
        );

        // 3. Build the fake OAuth2 user
        DefaultOAuth2User fakeUser = new DefaultOAuth2User(authorities, attributes, "email");
        OAuth2AuthenticationToken authReq = new OAuth2AuthenticationToken(fakeUser, authorities, "developer-bypass");

        // 4. Force Spring Security to accept this user
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(authReq);

        // 5. Save it to the session so the cookie is generated
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

        return ResponseEntity.ok(Map.of(
            "message", "Successfully bypassed login and created DB record for " + roleName,
            "role", roleName
        ));
    }
}