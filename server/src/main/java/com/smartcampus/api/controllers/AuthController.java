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
        String name = null;
        
        // If they logged in via Google/Microsoft
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
            picture = oauthUser.getAttribute("picture");
            name = oauthUser.getAttribute("name"); // Extract name for the form
        } else {
            // If they logged in manually, the principal is just their email string
            email = authentication.getName();
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        
        // 🛑 THE FIX: Handle new Microsoft users instead of throwing a 401 Error
        if (existingUser.isEmpty()) {
            if (authentication.getPrincipal() instanceof OAuth2User) {
                Map<String, Object> holdResponse = new HashMap<>();
                holdResponse.put("email", email);
                holdResponse.put("name", name);
                holdResponse.put("picture", picture);
                holdResponse.put("requiresRegistration", true); // Tells React to show the form!
                return ResponseEntity.ok(holdResponse);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found in DB");
        }

        // Standard response for existing users
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
    // --- 2. UPDATED: Backend Validation Added ---
   // --- 2. UPDATED: Strictly Secured Registration ---
    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody User newUserRequest) {
        
        if (newUserRequest.getEmail() == null || newUserRequest.getPassword() == null || newUserRequest.getName() == null) {
            return ResponseEntity.badRequest().body("Error: Name, Email, and Password are required!");
        }

        if (userRepository.findByEmail(newUserRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 🛑 SECURITY CHECK: Block Privilege Escalation
        String requestedRole = newUserRequest.getRole() != null ? newUserRequest.getRole().toUpperCase() : "STUDENT";
        if (requestedRole.equals("ADMIN") || requestedRole.equals("TECHNICIAN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Security Violation: Cannot self-register privileged accounts.");
        }

        // Optional: If you want to restrict Lecturers to a specific university domain, uncomment this!
        // if (requestedRole.equals("LECTURER") && !newUserRequest.getEmail().endsWith("@staff.university.edu")) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Lecturers must use a valid staff email.");
        // }

        User user = new User();
        user.setName(newUserRequest.getName());
        user.setEmail(newUserRequest.getEmail());
        user.setPassword(passwordEncoder.encode(newUserRequest.getPassword())); 
        user.setRole(requestedRole);
        
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
    // 👇 Change Map<String, String> to Map<String, Object> to prevent boolean crashes!
    public ResponseEntity<?> loginUser(@RequestBody Map<String, Object> loginRequest, HttpServletRequest request, HttpServletResponse response) {
        String email = (String) loginRequest.get("email");
        String password = (String) loginRequest.get("password");
        
        // Extract the Remember Me boolean safely
        boolean rememberMe = false;
        if (loginRequest.containsKey("rememberMe")) {
            rememberMe = (Boolean) loginRequest.get("rememberMe");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        User user = userOpt.get();

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
        
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(authReq);

        // 👇 Extend the server session to 30 days if they clicked "Remember Me"
        HttpSession session = request.getSession(true);
        if (rememberMe) {
            session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30 Days in seconds
        } else {
            session.setMaxInactiveInterval(1800); // 30 Minutes default
        }

        // Explicitly save the context to the response cookie
        securityContextRepository.saveContext(sc, request, response);

        return ResponseEntity.ok("Login successful");
    }

   // --- 3. UPDATED: Strictly Secured Profile Completion (OAuth) ---
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(Authentication authentication, @RequestBody Map<String, String> updates) {
        
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = null;
        String name = null;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");
        } else {
            email = authentication.getName(); 
        }

        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        // 🛑 SECURITY CHECK: Block Privilege Escalation for Microsoft/Google Users
        String requestedRole = updates.get("role") != null ? updates.get("role").toUpperCase() : "STUDENT";
        
        if (userOpt.isEmpty()) {
            // It's a new user! Check their requested role.
            if (requestedRole.equals("ADMIN") || requestedRole.equals("TECHNICIAN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Security Violation: Cannot self-register privileged accounts.");
            }
            
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : email.split("@")[0]);
            user.setRole(requestedRole);
        } else {
            // Existing user just updating profile (DO NOT let them change their role to Admin!)
            user = userOpt.get();
        }

        if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
        if (updates.containsKey("faculty")) user.setFaculty(updates.get("faculty"));
        if (updates.containsKey("registeredCourse")) user.setRegisteredCourse(updates.get("registeredCourse"));
        if (updates.containsKey("specialization")) user.setSpecialization(updates.get("specialization"));
        if (updates.containsKey("currentSemester")) user.setYearSemester(updates.get("currentSemester"));

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated and saved to DB!");
    }
}