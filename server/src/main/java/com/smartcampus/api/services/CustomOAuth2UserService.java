package com.smartcampus.api.services;

import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            // 1. Fetch data from Microsoft/Google
            OAuth2User oAuth2User = super.loadUser(userRequest);
            String clientRegistrationId = userRequest.getClientRegistration().getRegistrationId(); 

            System.out.println("\n================ OAUTH2 VERIFICATION ================");
            System.out.println("Provider: " + clientRegistrationId);

            // 2. Extract and fix Microsoft data quirks
            String name = oAuth2User.getAttribute("name");
            String email = oAuth2User.getAttribute("email");

            if (email == null) email = oAuth2User.getAttribute("preferred_username"); 
            if (email == null) email = oAuth2User.getAttribute("userPrincipalName"); 
            if (name == null && email != null) name = email.split("@")[0]; 

            if (email == null) {
                throw new OAuth2AuthenticationException("Missing email attribute from provider.");
            }

            // 3. Check DB, but DO NOT save! (Session Hold Method)
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                System.out.println("✅ Existing user recognized: " + email);
            } else {
                System.out.println("⏸️ SESSION HOLD: Verified email temporarily held. Waiting for user to complete React form: " + email);
            }

            // 4. Force the fixed email into the session attributes so AuthController can see it
            Map<String, Object> modifiedAttributes = new HashMap<>(oAuth2User.getAttributes());
            modifiedAttributes.put("email", email);
            modifiedAttributes.put("name", name);

            System.out.println("================ VERIFICATION SUCCESS ================\n");
            
            // Return the session to Spring Boot (Memory only, no DB save)
            return new DefaultOAuth2User(
                    oAuth2User.getAuthorities(),
                    modifiedAttributes,
                    "email" 
            );

        } catch (Exception e) {
            System.out.println("\n❌ CRITICAL OAUTH2 CRASH:");
            e.printStackTrace();
            throw new OAuth2AuthenticationException("Login process failed: " + e.getMessage());
        }
    }
}