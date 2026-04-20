package com.smartcampus.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    private String resourceCode;
    private String resourceName;
    private String block;
    private String level;
    private Integer capacity;
    private String type;
    private List<String> features;
    private List<String> utilityIds;
    private String status;
    private String access;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceCode() { return resourceCode; }
    public void setResourceCode(String resourceCode) { this.resourceCode = resourceCode; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public List<String> getUtilityIds() { return utilityIds; }
    public void setUtilityIds(List<String> utilityIds) { this.utilityIds = utilityIds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAccess() { return access; }
    public void setAccess(String access) { this.access = access; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
