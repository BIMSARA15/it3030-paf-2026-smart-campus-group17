package com.smartcampus.api.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.api.models.Resource;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    Optional<Resource> findByResourceCodeIgnoreCase(String resourceCode);
}
