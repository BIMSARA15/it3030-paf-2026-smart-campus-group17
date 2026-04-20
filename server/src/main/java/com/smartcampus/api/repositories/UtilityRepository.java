package com.smartcampus.api.repositories;

import com.smartcampus.api.models.Utility;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UtilityRepository extends MongoRepository<Utility, String> {
}
