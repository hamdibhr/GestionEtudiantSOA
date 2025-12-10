package com.university.auth.controller;

import com.university.auth.dto.AuthRequest;
import com.university.auth.model.User;
import com.university.auth.repository.UserRepository;
import com.university.auth.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository; // Connect to MongoDB

    @PostMapping("/register")
    public String register(@RequestBody AuthRequest authRequest) {
        // 1. Check if user exists in DB
        if (userRepository.findByUsername(authRequest.getUsername()).isPresent()) {
            throw new RuntimeException("User already exists!");
        }

        // 2. Set default role if missing
        String role = (authRequest.getRole() == null || authRequest.getRole().isEmpty()) 
                      ? "STUDENT" 
                      : authRequest.getRole().toUpperCase();

        // 3. Save to MongoDB
        User newUser = new User(authRequest.getUsername(), authRequest.getPassword(), role);
        userRepository.save(newUser);

        return "User registered as " + role;
    }

    @PostMapping("/login")
    public String getToken(@RequestBody AuthRequest authRequest) {
        // 1. Find user in DB
        Optional<User> userOptional = userRepository.findByUsername(authRequest.getUsername());

        // 2. Check password
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(authRequest.getPassword())) {
                // Generate Token with Role
                return jwtUtil.generateToken(user.getUsername(), user.getRole());
            }
        }
        throw new RuntimeException("Invalid username or password");
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        jwtUtil.validateToken(token);
        return "Token is valid";
    }
}