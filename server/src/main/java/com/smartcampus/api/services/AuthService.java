package com.smartcampus.api.services;

import com.smartcampus.api.dto.RegistrationDTO;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerNewUser(RegistrationDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        String requestedRole = dto.getRole() != null ? dto.getRole().toUpperCase() : "STUDENT";
        if (requestedRole.equals("ADMIN") || requestedRole.equals("TECHNICIAN")) {
            throw new SecurityException("Security Violation: Cannot self-register privileged accounts.");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(requestedRole);
        user.setFaculty(dto.getFaculty());
        user.setYearSemester(dto.getYearSemester());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setSpecialization(dto.getSpecialization());

        userRepository.save(user);
    }
}