package com.smartcampus.api.dto;

import java.util.List;

public class CreateBookingRequest {
    private String resourceId;
    private String userName;
    private String userId;
    private String userEmail;
    private String userDept;
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer attendees;
    private Integer quantity;
    private String lecturer;
    private String specialRequests;
    private List<String> requestedUtilityIds;

    // --- GETTERS AND SETTERS ---
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserDept() { return userDept; }
    public void setUserDept(String userDept) { this.userDept = userDept; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Integer getAttendees() { return attendees; }
    public void setAttendees(Integer attendees) { this.attendees = attendees; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getLecturer() { return lecturer; }
    public void setLecturer(String lecturer) { this.lecturer = lecturer; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public List<String> getRequestedUtilityIds() { return requestedUtilityIds; }
    public void setRequestedUtilityIds(List<String> requestedUtilityIds) { this.requestedUtilityIds = requestedUtilityIds; }
}