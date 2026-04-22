package com.smartcampus.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegistrationDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String role;
    private String faculty;
    private String yearSemester;
    private String registeredCourse;
    private String phoneNumber;
    private String specialization;

    // IMPORTANT: Generate Getters and Setters for all fields!
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getYearSemester() { return yearSemester; }
    public void setYearSemester(String yearSemester) { this.yearSemester = yearSemester; }
    public String getRegisteredCourse() { return registeredCourse; }
    public void setRegisteredCourse(String registeredCourse) { this.registeredCourse = registeredCourse; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}