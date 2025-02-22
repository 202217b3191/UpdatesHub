package com.updateshub.controllers;

import com.updateshub.models.Note;
import com.updateshub.repositories.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}) // Allow frontend requests
public class NoteController {

    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);
    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteRepository.findAll();
        return ResponseEntity.ok(notes);
    }

    @PostMapping
    // Removed @PreAuthorize to allow public access for testing
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        logger.info("Received Note: {}", note);
        Note savedNote = noteRepository.save(note);
        return ResponseEntity.ok(savedNote);
    }
}
