package com.smartcampus.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class DbCheckConfig {
    
    @Bean
    CommandLineRunner isConnected(MongoTemplate mongoTemplate) {
        return args -> {
            try {
                mongoTemplate.getDb().listCollectionNames();
                System.out.println("✅ Database Connection: SUCCESSFUL");
            } catch (Exception e) {
                System.out.println("❌ Database Connection: FAILED - " + e.getMessage());
            }
        };
    }
}
