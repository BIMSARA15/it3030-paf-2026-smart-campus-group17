package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
