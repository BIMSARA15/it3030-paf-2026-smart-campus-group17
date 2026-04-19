package com.smartcampus.api.services;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            // 1. Fetch the user details from Google or Microsoft
            OAuth2User oAuth2User = super.loadUser(userRequest);
            String clientRegistrationId = userRequest.getClientRegistration().getRegistrationId(); 
            
            // ====================================================================
            // 🛠️ DEBUGGING: PRINT EXACTLY WHAT THE PROVIDER SENT US
            // ====================================================================
            System.out.println("\n================ OAUTH2 LOGIN ATTEMPT ================");
            System.out.println("Provider Used: " + clientRegistrationId);
            System.out.println("Raw Data Received: " + oAuth2User.getAttributes());
            
            String name = oAuth2User.getAttribute("name");
            String email = oAuth2User.getAttribute("email");

            // Apply the Microsoft fallback BEFORE talking to MongoDB!
            if (email == null) {
                email = oAuth2User.getAttribute("preferred_username"); 
            }
            if (email == null) {
                email = oAuth2User.getAttribute("userPrincipalName"); 
            }

            // Fallback in case name is also missing from Microsoft
            if (name == null && email != null) {
                name = email.split("@")[0]; // Use the prefix of the email as a temporary name
            }

            System.out.println("Extracted Name: " + name);
            System.out.println("Extracted Email: " + email);

            // If it is STILL null, we must block it from crashing the database!
            if (email == null) {
                System.out.println("❌ ERROR: Email is completely missing from provider data!");
                System.out.println("======================================================\n");
                throw new OAuth2AuthenticationException("Missing email attribute from provider.");
            }

            // 2. NOW check if user exists in MongoDB
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                System.out.println("✅ Existing user found in DB: " + email);
                user = userOptional.get();
            } else {
                System.out.println("✨ Creating new user in DB for: " + email);
                user = new User();
                user.setEmail(email);
                user.setName(name);
                
                // SECURITY RULE: If they logged in with Google, force LECTURER role
                if ("google".equalsIgnoreCase(clientRegistrationId)) {
                    user.setRole("LECTURER");
                } else {
                    user.setRole("STUDENT"); 
                }
                userRepository.save(user);
                System.out.println("✅ New user successfully saved!");
            }

            System.out.println("================ OAUTH2 LOGIN SUCCESS ================\n");
            return oAuth2User; 

        } catch (Exception e) {
            System.out.println("\n❌ CRITICAL OAUTH2 CRASH:");
            e.printStackTrace();
            throw new OAuth2AuthenticationException("Login process failed: " + e.getMessage());
        }
    }
}