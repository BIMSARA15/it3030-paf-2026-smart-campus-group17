package com.smartcampus.api.dto;

import java.util.List;

public class UpdateBookingDetailsRequest {
    
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer attendees;
    private String lecturer;
    private String specialRequests;
    private List<String> requestedUtilityIds;

    // --- GETTERS AND SETTERS ---
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

    public String getLecturer() { return lecturer; }
    public void setLecturer(String lecturer) { this.lecturer = lecturer; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public List<String> getRequestedUtilityIds() { return requestedUtilityIds; }
    public void setRequestedUtilityIds(List<String> requestedUtilityIds) { this.requestedUtilityIds = requestedUtilityIds; }
}