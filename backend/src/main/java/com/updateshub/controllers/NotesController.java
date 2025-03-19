package com.updateshub.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.updateshub.models.Note;
import com.updateshub.repositories.NoteRepository;
import com.updateshub.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://127.0.0.1:5500") // Allow frontend requests
@RestController
@RequestMapping("/api/notes")
public class NotesController {

    @Autowired
    private NoteRepository notesRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // 🔹 Helper function to extract username from JWT
    private String extractUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.extractUsername(token);
    }

    // ✅ Save a note (Authenticated Users Only)
    @PostMapping
    public ResponseEntity<?> saveNote(@RequestBody Note note, HttpServletRequest request) {
        try {
            String username = extractUsername(request);
            note.setUsername(username); // Assign note to the user
            note.setNextReviewDate(LocalDateTime.now().plusDays(1)); // Default review in 1 day
            note.setReviewCount(0);
            note.setEaseFactor(2.5);
            note.setInterval(1);

            Note savedNote = notesRepository.save(note);
            return ResponseEntity.ok(savedNote);
        } catch (Exception e) {
            // Log the exception for debugging purposes
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to save the note. Please check your request data.");
        }
    }

    // ✅ Get All Notes of the Logged-In User
    @GetMapping
    public ResponseEntity<?> getNotes(HttpServletRequest request) {
        try {
            String username = extractUsername(request);
            List<Note> userNotes = notesRepository.findByUsername(username);
            return ResponseEntity.ok(userNotes);
        } catch (Exception e) {
            // Log the exception for debugging purposes
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must be authenticated to view notes.");
        }
    }

    // ✅ Get a Specific Note by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getNoteById(@PathVariable String id, HttpServletRequest request) {
        String username = extractUsername(request);
        Optional<Note> optionalNote = notesRepository.findById(id);

        if (optionalNote.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Note not found with the provided ID.");
        }

        Note note = optionalNote.get();

        // Ensure only the owner of the note can access it
        if (!note.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to view this note.");
        }

        return ResponseEntity.ok(note);
    }

    // ✅ Update a Note (Title, Content, and Review Details)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable String id, @RequestBody Note updatedNote,
                                        HttpServletRequest request) {
        String username = extractUsername(request);
        Note existingNote = notesRepository.findById(id).orElse(null);

        if (existingNote == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Note not found with the provided ID.");
        }

        // 🔥 Ensure only the owner can update this note
        if (!existingNote.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to update this note.");
        }

        // Update fields
        existingNote.setTitle(updatedNote.getTitle());
        existingNote.setContent(updatedNote.getContent());
        existingNote.setNextReviewDate(updatedNote.getNextReviewDate());

        Note savedNote = notesRepository.save(existingNote);
        return ResponseEntity.ok(savedNote);
    }

    // ✅ Mark a Note as Reviewed and Update Review Status
    @PostMapping("/{id}/review")
    public ResponseEntity<?> updateReviewStatus(@PathVariable String id, @RequestParam int quality,
                                               HttpServletRequest request) {
        String username = extractUsername(request);
        Note note = notesRepository.findById(id).orElse(null);

        if (note == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Note not found with the provided ID.");
        }

        // 🔥 Ensure only the owner can review this note
        if (!note.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to review this note.");
        }

        // ✅ Apply Spaced Repetition Algorithm
        updateSpacedRepetition(note, quality);

        Note updatedNote = notesRepository.save(note);
        return ResponseEntity.ok(updatedNote);
    }

    // ✅ Spaced Repetition Algorithm
    private void updateSpacedRepetition(Note note, int quality) {
        double easeFactor = note.getEaseFactor();
        int interval = note.getInterval();
        int reviewCount = note.getReviewCount();

        // 🔹 SM-2 Algorithm adjustments based on quality
        if (quality < 3) {
            interval = 1; // Reset interval if response is poor
        } else {
            if (reviewCount == 0) {
                interval = 1; // First review in 1 day
            } else if (reviewCount == 1) {
                interval = 6; // Second review in 6 days
            } else {
                interval = (int) Math.round(interval * easeFactor); // Future reviews
            }

            // Adjust ease factor based on quality response
            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (easeFactor < 1.3) {
                easeFactor = 1.3; // Minimum ease factor
            }
        }

        // Update Note object with new values
        note.setReviewCount(reviewCount + 1);
        note.setEaseFactor(easeFactor);
        note.setInterval(interval);
        note.setNextReviewDate(LocalDateTime.now().plusDays(interval));
    }

    // ✅ Delete a Note
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable String id, HttpServletRequest request) {
        String username = extractUsername(request);
        Note existingNote = notesRepository.findById(id).orElse(null);

        if (existingNote == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Note not found with the provided ID.");
        }

        // 🔥 Ensure only the owner can delete this note
        if (!existingNote.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this note.");
        }

        notesRepository.delete(existingNote);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
