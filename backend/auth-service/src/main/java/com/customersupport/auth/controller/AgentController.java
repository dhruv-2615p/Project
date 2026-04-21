package com.customersupport.auth.controller;

import com.customersupport.auth.dto.TicketResponse;
import com.customersupport.auth.entity.User;
import com.customersupport.auth.repository.UserRepository;
import com.customersupport.auth.service.TicketService;
import com.customersupport.auth.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final TicketService ticketService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AgentController(TicketService ticketService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    private String extractAndValidateAgent(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing authorization token");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"AGENT".equals(user.getRole())) {
            throw new RuntimeException("Access denied: Agent role required");
        }
        return email;
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getAgentTickets(@RequestHeader("Authorization") String authHeader) {
        try {
            extractAndValidateAgent(authHeader);
            List<TicketResponse> tickets = ticketService.getAllOpenTickets();
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/tickets/{id}/respond")
    public ResponseEntity<?> respondToTicket(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String agentEmail = extractAndValidateAgent(authHeader);
            String response = request.get("response");
            if (response == null || response.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Response is required"));
            }
            TicketResponse ticket = ticketService.addAgentResponse(id, agentEmail, response);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/tickets/{id}/assign")
    public ResponseEntity<?> assignTicket(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            String agentEmail = extractAndValidateAgent(authHeader);
            TicketResponse ticket = ticketService.assignTicket(id, agentEmail);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            extractAndValidateAgent(authHeader);
            String status = request.get("status");
            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            TicketResponse ticket = ticketService.updateTicketStatusByAgent(id, status);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
