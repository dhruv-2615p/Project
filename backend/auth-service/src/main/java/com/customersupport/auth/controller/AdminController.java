package com.customersupport.auth.controller;

import com.customersupport.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String ADMIN_KEY = "admin-ai-support-2026";

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestHeader("X-Admin-Key") String key) {
        if (!ADMIN_KEY.equals(key)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "fullName", u.getFullName(),
                        "email", u.getEmail(),
                        "emailVerified", u.isEmailVerified(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "unknown"
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{email}")
    public ResponseEntity<?> deleteUser(@PathVariable String email,
                                        @RequestHeader("X-Admin-Key") String key) {
        if (!ADMIN_KEY.equals(key)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
        return ResponseEntity.ok(Map.of("message", "User deleted: " + email));
    }

    @PutMapping("/users/{email}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String email,
                                            @RequestHeader("X-Admin-Key") String key,
                                            @RequestBody Map<String, String> request) {
        if (!ADMIN_KEY.equals(key)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        String role = request.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setRole(role.toUpperCase());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "User " + email + " role updated to " + role.toUpperCase()));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
