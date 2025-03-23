package com.updateshub.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.updateshub.models.Blackout;
import com.updateshub.repositories.BlackoutRepository;
import com.updateshub.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RestController
@RequestMapping("/api/blackout")
public class BlackoutController {

    private static final Logger logger = LoggerFactory.getLogger(BlackoutController.class);

    @Autowired
    private BlackoutRepository blackoutRepository;

    @Autowired
    private JwtService jwtService;

    private String extractUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("❌ Unauthorized access attempt - No valid Authorization header.");
            throw new RuntimeException("Unauthorized access.");
        }
        String token = authHeader.substring(7);
        return jwtService.extractUsername(token);
    }

    @PostMapping
    public ResponseEntity<Blackout> addBlackout(@RequestBody Blackout blackout, HttpServletRequest request) {
        String username = extractUsername(request);
        blackout.setUsername(username);
        Blackout savedBlackout = blackoutRepository.save(blackout);
        return ResponseEntity.ok(savedBlackout);
    }

    @GetMapping
    public ResponseEntity<List<Blackout>> getBlackouts(HttpServletRequest request) {
        String username = extractUsername(request);
        LocalDateTime now = LocalDateTime.now();
        List<Blackout> userBlackouts = blackoutRepository.findByUsernameAndStartBeforeAndEndAfter(username, now, now);
        return ResponseEntity.ok(userBlackouts);
    }
}
