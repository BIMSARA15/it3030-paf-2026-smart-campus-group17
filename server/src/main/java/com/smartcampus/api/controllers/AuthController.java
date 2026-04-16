package com.smartcampus.api.controllers;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injected BCrypt encoder
    private SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    // --- 1. UPDATED: Handles BOTH OAuth2 and Manual Logins ---
    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String email = null;
        String picture = null;
        
        // If they logged in via Google/Microsoft
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
            picture = oauthUser.getAttribute("picture");
        } else {
            // If they logged in manually, the principal is just their email string
            email = authentication.getName();
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found in DB");
        }

        User dbUser = existingUser.get();
        boolean profileComplete = (dbUser.getPhoneNumber() != null && dbUser.getFaculty() != null);

        Map<String, Object> response = new HashMap<>();
        response.put("id", dbUser.getId()); 
        response.put("name", dbUser.getName());
        response.put("email", dbUser.getEmail());
        response.put("role", dbUser.getRole());
        response.put("picture", picture); 
        response.put("profileComplete", profileComplete);

        return ResponseEntity.ok(response);
    }

    // --- 2. UPDATED: Save the hashed password during registration ---
    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody User newUserRequest) {
        if (userRepository.findByEmail(newUserRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(newUserRequest.getName());
        user.setEmail(newUserRequest.getEmail());
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(newUserRequest.getPassword())); 
        user.setRole(newUserRequest.getRole() != null ? newUserRequest.getRole() : "STUDENT");
        user.setFaculty(newUserRequest.getFaculty());
        
        if (newUserRequest.getYearSemester() != null) user.setYearSemester(newUserRequest.getYearSemester());
        if (newUserRequest.getRegisteredCourse() != null) user.setRegisteredCourse(newUserRequest.getRegisteredCourse());
        if (newUserRequest.getPhoneNumber() != null) user.setPhoneNumber(newUserRequest.getPhoneNumber());
        if (newUserRequest.getSpecialization() != null) user.setSpecialization(newUserRequest.getSpecialization());

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    // --- 3. NEW: Manual Login Endpoint ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // 1. Find user and check password
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        User user = userOpt.get();

        // 2. Tell Spring Security this user is officially logged in
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
        
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(authReq);

        // 3. Save the session cookie so React remembers them
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

        return ResponseEntity.ok("Login successful");
    }

   @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(Authentication authentication, @RequestBody Map<String, String> updates) {
        
        // 1. Make sure they are logged in
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. Safely extract the email whether they used OAuth2 or Manual Login
        String email = null;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
        } else {
            email = authentication.getName(); // Manual login uses getName()
        }

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 3. Find the user and update their profile
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPhoneNumber(updates.get("phoneNumber"));
        user.setFaculty(updates.get("faculty"));
        user.setRegisteredCourse(updates.get("registeredCourse"));
        user.setSpecialization(updates.get("specialization"));
        user.setYearSemester(updates.get("currentSemester"));

        // Update role if they selected student/lecturer during onboarding
        if (updates.containsKey("role")) {
            user.setRole(updates.get("role").toUpperCase());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated");
    }
}