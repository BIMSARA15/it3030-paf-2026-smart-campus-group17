package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Payload for POST /api/tickets/{id}/images.
 * Hard cap of 3 URLs is enforced both here and in the service for safety.
 */
public class UploadImagesRequest {

    public static final int MAX_IMAGES = 3;

    @NotNull(message = "imageUrls is required")
    @Size(max = MAX_IMAGES, message = "A ticket can have at most 3 images")
    private List<String> imageUrls;

    public UploadImagesRequest() {}

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
