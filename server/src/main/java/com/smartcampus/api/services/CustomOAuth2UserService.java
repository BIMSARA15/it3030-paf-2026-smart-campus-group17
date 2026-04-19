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
        // 1. Fetch the user details from Google or Microsoft
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String clientRegistrationId = userRequest.getClientRegistration().getRegistrationId(); // "google" or "microsoft"
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // 2. Check if user exists in MongoDB
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            // If new user, create them in the DB
            user = new User();
            user.setEmail(email);
            user.setName(name);
            
            // SECURITY RULE: If they logged in with Google, force LECTURER role
            if ("google".equalsIgnoreCase(clientRegistrationId)) {
                user.setRole("LECTURER");
            } else {
                // Default fallback for Microsoft (You can change this based on your university domain rules)
                user.setRole("STUDENT"); 
            }
            userRepository.save(user);
        }

        // Return the user to Spring Security
        return oAuth2User; 
    }
}