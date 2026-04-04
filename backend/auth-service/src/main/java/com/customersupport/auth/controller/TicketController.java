package com.customersupport.auth.controller;

import com.customersupport.auth.dto.CreateTicketRequest;
import com.customersupport.auth.dto.DashboardStats;
import com.customersupport.auth.dto.TicketResponse;
import com.customersupport.auth.service.TicketService;
import com.customersupport.auth.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final JwtUtil jwtUtil;

    public TicketController(TicketService ticketService, JwtUtil jwtUtil) {
        this.ticketService = ticketService;
        this.jwtUtil = jwtUtil;
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing authorization token");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        return jwtUtil.extractEmail(token);
    }

    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateTicketRequest request) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            TicketResponse response = ticketService.createTicket(userEmail, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserTickets(@RequestHeader("Authorization") String authHeader) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            List<TicketResponse> tickets = ticketService.getUserTickets(userEmail);
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            TicketResponse ticket = ticketService.getTicketById(id, userEmail);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            String status = request.get("status");
            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            TicketResponse ticket = ticketService.updateTicketStatus(id, status, userEmail);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/ai-response")
    public ResponseEntity<?> addAiResponse(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            String aiResponse = request.get("aiResponse");
            if (aiResponse == null || aiResponse.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "AI response is required"));
            }
            TicketResponse ticket = ticketService.addAiResponse(id, aiResponse, userEmail);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String authHeader) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            DashboardStats stats = ticketService.getDashboardStats(userEmail);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
