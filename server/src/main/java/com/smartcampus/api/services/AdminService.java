package com.smartcampus.api.services;

import com.smartcampus.api.dto.ProvisionTechnicianDTO;
import com.smartcampus.api.models.User;
import com.smartcampus.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllTechnicians() {
        return userRepository.findByRole("TECHNICIAN");
    }

    public void provisionTechnician(ProvisionTechnicianDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Error: This email is already registered in the system.");
        }

        User technician = new User();
        technician.setEmail(dto.getEmail());
        technician.setName(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : dto.getEmail().split("@")[0]);
        technician.setPhoneNumber(dto.getPhoneNumber());
        technician.setRole("TECHNICIAN");
        technician.setAvailable(true);

        userRepository.save(technician);
    }

    public void toggleTechnicianStatus(String id, Boolean isAvailable) {
        User technician = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found."));
        
        technician.setAvailable(isAvailable);
        userRepository.save(technician);
    }

    public void deleteTechnician(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Technician not found.");
        }
        userRepository.deleteById(id);
    }
}