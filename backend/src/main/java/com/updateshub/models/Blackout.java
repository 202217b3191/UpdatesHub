package com.updateshub.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "blackouts")
public class Blackout {
    @Id
    private String id;
    private String username;  // Who scheduled the blackout
    private LocalDateTime start;
    private LocalDateTime end;
    private String appliedBy; // Admin or user who applied the blackout

    // Constructors
    public Blackout() {}

    public Blackout(String username, LocalDateTime start, LocalDateTime end, String appliedBy) {
        this.username = username;
        this.start = start;
        this.end = end;
        this.appliedBy = appliedBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    public String getAppliedBy() { return appliedBy; }
    public void setAppliedBy(String appliedBy) { this.appliedBy = appliedBy; } // ✅ Added this method
}
