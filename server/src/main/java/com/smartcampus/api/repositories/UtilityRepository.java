package com.smartcampus.api.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.api.models.Utility;

public interface UtilityRepository extends MongoRepository<Utility, String> {

    Optional<Utility> findByUtilityCodeIgnoreCase(String utilityCode);
}
