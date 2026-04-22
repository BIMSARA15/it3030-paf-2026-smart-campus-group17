package com.smartcampus.api.services;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends OidcUserService { // 👈 UPGRADED TO OIDC

    @Autowired
    private UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oauthUser = super.loadUser(userRequest);

        // 1. Get the Access Token
        String accessToken = userRequest.getAccessToken().getTokenValue();

        // 2. Call Microsoft Graph API for the FULL Enterprise Profile
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        String graphUrl = "https://graph.microsoft.com/v1.0/me?$select=mail,givenName,surname,jobTitle,department,officeLocation,mobilePhone,employeeId";
        
        Map<String, Object> graphData = null;
        try {
            ResponseEntity<Map> response = restTemplate.exchange(graphUrl, HttpMethod.GET, entity, Map.class);
            graphData = response.getBody();
        } catch (Exception e) {
            System.err.println("Microsoft Graph API call failed: " + e.getMessage());
        }

        // 3. Extract the data directly from the Graph API response
        String email = oauthUser.getAttribute("email");
        String firstName = oauthUser.getAttribute("given_name");
        String lastName = oauthUser.getAttribute("family_name");
        
        String department = null;
        String specialization = null;
        String currentSemester = null;
        String studentOrEmployeeId = null;
        String mobilePhone = null;

        if (graphData != null) {
            if (graphData.get("department") != null) department = (String) graphData.get("department");
            if (graphData.get("jobTitle") != null) specialization = (String) graphData.get("jobTitle");
            if (graphData.get("officeLocation") != null) currentSemester = (String) graphData.get("officeLocation");
            if (graphData.get("employeeId") != null) studentOrEmployeeId = (String) graphData.get("employeeId");
            if (graphData.get("mobilePhone") != null) mobilePhone = (String) graphData.get("mobilePhone");
        }

        // 4. Determine Role
        List<String> azureRoles = oauthUser.getAttribute("roles");
        String assignedRole = "STUDENT"; 
        if (azureRoles != null && !azureRoles.isEmpty()) {
            assignedRole = azureRoles.get(0).toUpperCase(); 
        }

        // 5. Find or Create User in MongoDB
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user = userOpt.orElse(new User());

        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setName(((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim());
        user.setRole(assignedRole);
        if (mobilePhone != null) user.setPhoneNumber(mobilePhone);

        // 6. Role Mapping
        if (assignedRole.equals("STUDENT")) {
            if (studentOrEmployeeId != null) user.setId(studentOrEmployeeId);
            if (department != null) user.setFaculty(department);                
            if (specialization != null) user.setSpecialization(specialization); 
            if (currentSemester != null) user.setYearSemester(currentSemester); 
        } 
        else if (assignedRole.equals("LECTURER")) {
            if (studentOrEmployeeId != null) user.setId(studentOrEmployeeId);
            if (department != null) user.setFaculty(department);                
        } 
        else if (assignedRole.equals("TECHNICIAN") || assignedRole.equals("ADMIN")) {
            if (studentOrEmployeeId != null) user.setId(studentOrEmployeeId);
            if (department != null) user.setDepartment(department);             
            user.setAvailable(true); 
        }

        userRepository.save(user);

        // 7. Give Spring the Role Badge
        Set<GrantedAuthority> mappedAuthorities = new HashSet<>(oauthUser.getAuthorities());
        mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + assignedRole));

        return new DefaultOidcUser(mappedAuthorities, oauthUser.getIdToken(), oauthUser.getUserInfo());
    }
}