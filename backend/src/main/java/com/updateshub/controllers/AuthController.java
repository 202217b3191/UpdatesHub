package com.updateshub.controllers;

import com.updateshub.models.User;
import com.updateshub.repositories.UserRepository;
import com.updateshub.security.JwtService; // Use the unified JwtService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}) // Allow frontend requests (and other origins if needed)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService; // Use the unified JwtService

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

   @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Check if user already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists"); // Use ResponseEntity
        }

        // Encrypt password and save user
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully"); // Use ResponseEntity
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        // Fetch user from the database
        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials"); // Use ResponseEntity
        }

        // Generate JWT token
        String token = jwtService.generateToken(existingUser); // Use JwtService and pass UserDetails

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }
}