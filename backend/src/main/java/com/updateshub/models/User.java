package com.updateshub.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections; 

@Document(collection = "users")
public class User implements UserDetails { // Directly implement UserDetails
    @Id
    private String id;
    private String username;
    private String password;

    
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
        return Collections.emptyList(); 
        
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
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; 
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; 
    }

    @Override
    public boolean isEnabled() {
        return true; 
    }
}