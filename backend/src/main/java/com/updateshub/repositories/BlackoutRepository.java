package com.updateshub.repositories;

import com.updateshub.models.Blackout;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BlackoutRepository extends MongoRepository<Blackout, String> {
    List<Blackout> findByUsernameAndStartBeforeAndEndAfter(String username, LocalDateTime now, LocalDateTime nowPlus);
}
