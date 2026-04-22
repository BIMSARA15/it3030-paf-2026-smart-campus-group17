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
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
// IMPORTANT: This prevents this backdoor from running in production
@Profile("!prod") 
public class DevAuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dev-login/{role}")
    public ResponseEntity<?> devLogin(@PathVariable String role, HttpServletRequest request) {
        String roleName = role.toUpperCase();
        
        // 1. Initialize user with common fields
        User devUser = new User();
        devUser.setRole(roleName);
        devUser.setAvailable(true);
        devUser.setPassword("dummy_dev_password"); // Optional

        // 2. Populate user matching the REAL database structure for each role
        switch (roleName) {
            case "STUDENT":
                devUser.setId("IT99999991");
                devUser.setName("Dev Student A.B.C");
                devUser.setFirstName("Dev");
                devUser.setLastName("Student");
                devUser.setEmail("IT99999991@smartcampus.lk");
                devUser.setFaculty("Faculty of Computing");
                devUser.setYearSemester("Y3S2");
                devUser.setSpecialization("Information Technology");
                devUser.setPhoneNumber("0770000001");
                break;
                
            case "ADMIN":
                devUser.setId("SS99999991");
                devUser.setName("Dev Admin");
                devUser.setFirstName("Dev");
                devUser.setLastName("Admin");
                devUser.setEmail("Dev.A@kndyUNI.lk");
                devUser.setDepartment("Student Services");
                devUser.setPhoneNumber("0760000001");
                break;
                
            case "LECTURER":
                devUser.setId("IT99999992");
                devUser.setName("Dev Lecturer");
                devUser.setFirstName("Dev");
                devUser.setLastName("Lecturer");
                devUser.setEmail("Dev.L@KandyUNI.lk");
                devUser.setFaculty("Faculty of Computing");
                devUser.setPhoneNumber("0770000002");
                break;
                
            case "TECHNICIAN":
                devUser.setId("TS99999991");
                devUser.setName("Dev Technician");
                devUser.setFirstName("Dev");
                devUser.setLastName("Technician");
                devUser.setEmail("Dev.T@Tech.lk");
                devUser.setDepartment("Technical");
                devUser.setPhoneNumber("0750000001");
                break;
                
            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role specified"));
        }

        // 3. Save to database (Check by explicit ID so we don't duplicate keys)
        Optional<User> existingUserOpt = userRepository.findById(devUser.getId());
        if (existingUserOpt.isEmpty()) {
            userRepository.save(devUser);
        } else {
            // Overwrite existing dev user to ensure schema updates are applied
            userRepository.save(devUser);
        }

        // 4. Create fake authorities based on the requested role
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

        // 5. Create fake user attributes to mimic Microsoft/Google AND include our explicit String ID
        Map<String, Object> attributes = Map.of(
            "email", devUser.getEmail(),
            "name", devUser.getName(),
            "id", devUser.getId() // Crucial for the React frontend!
        );

        // 6. Build the fake OAuth2 user
        DefaultOAuth2User fakeUser = new DefaultOAuth2User(authorities, attributes, "email");
        OAuth2AuthenticationToken authReq = new OAuth2AuthenticationToken(fakeUser, authorities, "developer-bypass");

        // 7. Force Spring Security to accept this user
        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(authReq);

        // 8. Save it to the session so the cookie is generated
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

        return ResponseEntity.ok(Map.of(
            "message", "Successfully bypassed login as " + roleName + " with production-accurate schema!",
            "role", roleName,
            "user", devUser // Returns the full object so you can verify it on the frontend network tab
        ));
    }
}