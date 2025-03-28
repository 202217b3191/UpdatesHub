package com.updateshub.repositories;

import com.updateshub.models.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Date;


public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByNextReviewDateBefore(Date date);
    List<Note> findByUsername(String username);

    
    List<Note> findByUsernameAndNextReviewDateAfter(String username, LocalDateTime nextReviewDate);
}
