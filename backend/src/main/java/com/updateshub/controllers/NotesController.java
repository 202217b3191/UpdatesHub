package com.updateshub.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.updateshub.models.Note;
import com.updateshub.repositories.NoteRepository;
import com.updateshub.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RestController
@RequestMapping("/api/notes") // Now all endpoints start with /api/notes
public class NotesController {

    private static final Logger logger = LoggerFactory.getLogger(NotesController.class);

    @Autowired
    private NoteRepository notesRepository;

    @Autowired
    private JwtService jwtService;

    private String extractUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Missing or invalid Authorization header");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        return jwtService.extractUsername(token);
    }

    @PostMapping
    public ResponseEntity<?> saveNote(@RequestBody Note note, HttpServletRequest request) {
        try {
            String username = extractUsername(request);
            note.setUsername(username);
            note.setNextReviewDate(LocalDateTime.now().plusDays(1));
            note.setReviewCount(0);
            note.setEaseFactor(2.5);
            note.setInterval(1);

            Note savedNote = notesRepository.save(note);
            return ResponseEntity.ok(savedNote);
        } catch (Exception e) {
            logger.error("Failed to save the note", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to save the note.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getNotes(HttpServletRequest request) {
        try {
            String username = extractUsername(request);
            List<Note> userNotes = notesRepository.findByUsername(username);
            return ResponseEntity.ok(userNotes);
        } catch (Exception e) {
            logger.error("Failed to fetch notes", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be authenticated to view notes.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable String id, HttpServletRequest request) {
        String username = extractUsername(request);
        Optional<Note> optionalNote = notesRepository.findById(id);

        if (optionalNote.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
        }

        Note note = optionalNote.get();
        if (!note.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized access.");
        }

        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable String id, @RequestBody Note updatedNote, HttpServletRequest request) {
        String username = extractUsername(request);
        Note existingNote = notesRepository.findById(id).orElse(null);

        if (existingNote == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
        }

        if (!existingNote.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized access.");
        }

        existingNote.setTitle(updatedNote.getTitle());
        existingNote.setContent(updatedNote.getContent());
        existingNote.setNextReviewDate(updatedNote.getNextReviewDate());

        Note savedNote = notesRepository.save(existingNote);
        return ResponseEntity.ok(savedNote);
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<?> updateReviewStatus(@PathVariable String id, @RequestParam int quality, HttpServletRequest request) {
        String username = extractUsername(request);
        Note note = notesRepository.findById(id).orElse(null);

        if (note == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
        }

        if (!note.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized access.");
        }

        updateSpacedRepetition(note, quality);
        Note updatedNote = notesRepository.save(note);
        return ResponseEntity.ok(updatedNote);
    }

    private void updateSpacedRepetition(Note note, int quality) {
        double easeFactor = note.getEaseFactor();
        int interval = note.getInterval();
        int reviewCount = note.getReviewCount();

        if (quality < 3) {
            interval = 1;
        } else {
            if (reviewCount == 0) {
                interval = 1;
            } else if (reviewCount == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(interval * easeFactor);
            }

            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (easeFactor < 1.3) {
                easeFactor = 1.3;
            }
        }

        note.setReviewCount(reviewCount + 1);
        note.setEaseFactor(easeFactor);
        note.setInterval(interval);
        note.setNextReviewDate(LocalDateTime.now().plusDays(interval));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id, HttpServletRequest request) {
        String username = extractUsername(request);
        Note existingNote = notesRepository.findById(id).orElse(null);

        if (existingNote == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found.");
        }

        if (!existingNote.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized access.");
        }

        notesRepository.delete(existingNote);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getUserProgress(HttpServletRequest request) {
        String username = extractUsername(request);
        List<Note> notes = notesRepository.findByUsername(username);

        int completedReviews = notes.stream().mapToInt(Note::getReviewCount).sum();
        int totalNotes = notes.size();

        Map<String, Object> progress = new HashMap<>();
        progress.put("completedReviews", completedReviews);
        progress.put("totalNotes", totalNotes);

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/upcoming-reviews")
    public ResponseEntity<List<Note>> getUpcomingReviews(HttpServletRequest request) {
        String username = extractUsername(request);
        List<Note> upcomingNotes = notesRepository.findByUsernameAndNextReviewDateAfter(username, LocalDateTime.now());
        return ResponseEntity.ok(upcomingNotes);
    }
}
