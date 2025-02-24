package com.updateshub.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.updateshub.models.Note;
import com.updateshub.repositories.*;
import com.updateshub.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5500")  // Allow frontend requests
public class NotesController {

    @Autowired
    private NoteRepository notesRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Helper function to extract username from token
    private String extractUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.extractUsername(token);
    }

    @PostMapping
    public Note saveNote(@RequestBody Note note, HttpServletRequest request) {
        String username = extractUsername(request);
        note.setUsername(username);  // Save notes under the user's name
        return notesRepository.save(note);
    }

    @GetMapping
    public List<Note> getNotes(HttpServletRequest request) {
        String username = extractUsername(request);
        return notesRepository.findByUsername(username);
    }
}
