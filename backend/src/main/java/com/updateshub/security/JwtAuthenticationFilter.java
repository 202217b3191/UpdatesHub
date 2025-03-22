package com.updateshub.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.updateshub.services.UserDetailsServiceImpl;
import org.springframework.lang.NonNull;  // Use @NonNull for clarity

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService; // Use unified JwtService
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        //  Early exit if no Authorization header or not a Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        try {
            final String username = jwtService.extractUsername(token);  // Use JwtService

            //  Only proceed if username is valid and no authentication exists
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(token, userDetails)) {
                    // Create authentication token and set it in the security context
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    //  This is redundant, as the exceptions below will handle invalid tokens
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                    return; // Stop processing
                }
            }
        } catch (ExpiredJwtException ex) {
            // Handle expired token specifically
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT token is expired");
            return;  // Stop processing
        } catch (MalformedJwtException | SignatureException ex) {
            // Handle malformed or signature-invalid tokens
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
            return;  // Stop processing
        } catch (Exception ex) {
             // Catch any other exceptions during token processing
            logger.error("An error occurred during JWT authentication", ex);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An error occurred during authentication");
            return;
        }

        filterChain.doFilter(request, response); // Continue the filter chain
    }
}