package com.smartcampus.api.exceptions;

/** Thrown when a ticket would exceed the per-ticket image cap. Mapped to HTTP 400. */
public class ImageLimitExceededException extends RuntimeException {
    public ImageLimitExceededException(int limit) {
        super("A ticket can have at most " + limit + " images");
    }
}
