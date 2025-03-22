package com.updateshub.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "blackouts")
public class Blackout {
    @Id
    private String id;
    private String name; // Added name attribute
    private String username;  //  user associated with the blackout
    private LocalDateTime start;
    private LocalDateTime end;
    private String user; //  user who applied the blackout

    // Constructors
    public Blackout() {}

    public Blackout(String name, String username, LocalDateTime start, LocalDateTime end, String user) {
        this.name = name; // Initialize name
        this.username = username;
        this.start = start;
        this.end = end;
        this.user = user;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; } // Getter for name
    public void setName(String name) { this.name = name; } // Setter for name

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    public String getUser() { return user; } // Corrected getter name
    public void setUser(String user) { this.user = user; } // Corrected setter name
}