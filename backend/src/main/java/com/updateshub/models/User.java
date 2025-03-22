package com.updateshub.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections; // Use Collections.emptyList()

@Document(collection = "users")
public class User implements UserDetails { // Directly implement UserDetails
    @Id
    private String id;
    private String username;
    private String password;

    // Default constructor (required by frameworks like Spring Data)
    public User() {}

    // Constructor
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and setters for id, username
    public String getId() {
        return id;
    }
    public void setId(String id){
        this.id = id;
    }

     public void setUsername(String username) {
        this.username = username;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // Return an empty list if no roles/authorities
        // Or, if you have roles:
        // return List.of(new SimpleGrantedAuthority("ROLE_USER")); // Example with a single role
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Or implement your logic
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Or implement your logic
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Or implement your logic
    }

    @Override
    public boolean isEnabled() {
        return true; // Or implement your logic
    }
}