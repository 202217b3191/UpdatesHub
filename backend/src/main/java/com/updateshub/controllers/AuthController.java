package com.updateshub.controllers;

import com.updateshub.models.User;
import com.updateshub.repositories.UserRepository;
import com.updateshub.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5500")  // Allow frontend requests
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody User user) {
        // Check if user already exists
        boolean userExists = userRepository.findByUsername(user.getUsername()).isPresent();
        if (userExists) {
            throw new RuntimeException("User already exists");
        }

        // Encrypt password and save user
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return response;
    }

    @PostMapping("/login")
    public Map<String, String> loginUser(@RequestBody User user) {
        // Fetch user from the database
        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(existingUser.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }
}
