package com.smartcampus.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String firstName; // Optional: Can be derived from name if needed
    private String lastName;  // Optional: Can be derived from name if needed
    private String email;
    private String password; // Optional: Only needed if you plan to support non-OAuth users in the future
    private String role; // e.g., "USER", "ADMIN", "TECHNICIAN"
    private String oauthId; // To store the Google Sign-in ID later
    private String faculty; // New field for faculty
    private String yearSemester; // New field for year and semester  
    private String phoneNumber; // New field for phone number
    private String specialization;
    private boolean available = true; // Default to true when created
    private String department;

    // Constructors
    public User() {}

    public User(String name, String email, String role, String oauthId) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.oauthId = oauthId;
    }

    // Getters and Setters (You can generate these in VS Code or type them out)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getDepartment() { return department; }
public void setDepartment(String department) { this.department = department; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getOauthId() { return oauthId; }
    public void setOauthId(String oauthId) { this.oauthId = oauthId; }
    public String getFaculty() { return faculty;}
    public void setFaculty(String faculty) { this.faculty = faculty;}
    public String getYearSemester() {return yearSemester;}
    public void setYearSemester(String yearSemester) {this.yearSemester = yearSemester;}
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public boolean isAvailable() {return available;} 
    public void setAvailable(boolean available) { this.available = available;}

}