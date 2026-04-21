package com.customersupport.auth.blackbox;

import com.customersupport.auth.dto.AuthResponse;
import com.customersupport.auth.service.AuthService;
import com.customersupport.auth.service.OtpService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BLACK BOX (FUNCTIONAL) TESTS - Auth & Ticket Controllers
 * Tests HTTP endpoints as a consumer would, using H2 in-memory database.
 * No knowledge of internal implementation, only verifies request/response
 * contracts.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private OtpService otpService;

    // ==================== AUTH ENDPOINTS ====================

    @Test
    @DisplayName("BB-AUTH-01: POST /api/auth/register - successful registration")
    void register_success() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Test User",
                        "email", "register-test@example.com",
                        "password", "Abcdef1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.email").value("register-test@example.com"));
    }

    @Test
    @DisplayName("BB-AUTH-02: POST /api/auth/register - duplicate email returns 400")
    void register_duplicateEmail() throws Exception {
        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "User One",
                        "email", "dup-test@example.com",
                        "password", "Abcdef1!"))));

        // Wait for async OTP send to complete/fail before generating our own
        Thread.sleep(500);

        // Verify email first so the "already registered" path hits
        String otp = otpService.generateOtp("dup-test@example.com");
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "dup-test@example.com",
                        "otp", otp))));

        // Duplicate attempt
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "User Two",
                        "email", "dup-test@example.com",
                        "password", "Abcdef1!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already registered"));
    }

    @Test
    @DisplayName("BB-AUTH-03: POST /api/auth/register - invalid email format returns 400")
    void register_invalidEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Test",
                        "email", "not-an-email",
                        "password", "Abcdef1!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("BB-AUTH-04: POST /api/auth/register - weak password returns 400")
    void register_weakPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Test",
                        "email", "weak-pw@example.com",
                        "password", "abc"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("BB-AUTH-05: POST /api/auth/login - unverified email returns 400")
    void login_unverifiedEmail() throws Exception {
        // Register but don't verify
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Unverified User",
                        "email", "unverified@example.com",
                        "password", "Abcdef1!"))));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "unverified@example.com",
                        "password", "Abcdef1!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email not verified. Please verify your email first."));
    }

    @Test
    @DisplayName("BB-AUTH-06: Full flow - register, verify OTP, login returns JWT")
    void fullAuthFlow() throws Exception {
        // 1. Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Flow User",
                        "email", "flow@example.com",
                        "password", "Abcdef1!"))))
                .andExpect(status().isOk());

        // Wait for async OTP send to complete/fail before generating our own
        Thread.sleep(500);

        // 2. Generate OTP directly (bypassing email sending)
        String otp = otpService.generateOtp("flow@example.com");

        // 3. Verify OTP
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "flow@example.com",
                        "otp", otp))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully"));

        // 4. Login - should return token
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "flow@example.com",
                        "password", "Abcdef1!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.fullName").value("Flow User"))
                .andExpect(jsonPath("$.email").value("flow@example.com"));
    }

    @Test
    @DisplayName("BB-AUTH-07: POST /api/auth/login - wrong password returns 400")
    void login_wrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "nobody@example.com",
                        "password", "WrongPass1!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    @DisplayName("BB-AUTH-08: GET /api/auth/validate - invalid token returns 401")
    void validate_invalidToken() throws Exception {
        mockMvc.perform(get("/api/auth/validate")
                .header("Authorization", "Bearer invalid-token-here"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @DisplayName("BB-AUTH-09: POST /api/auth/verify-otp - wrong OTP returns 400")
    void verifyOtp_wrongCode() throws Exception {
        // Register first
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "OTP Test",
                        "email", "otp-wrong@example.com",
                        "password", "Abcdef1!"))));

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "otp-wrong@example.com",
                        "otp", "000000"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid or expired OTP"));
    }

    // ==================== TICKET ENDPOINTS ====================

    @Test
    @DisplayName("BB-TICKET-01: POST /api/tickets - without auth returns 400")
    void createTicket_noAuth() throws Exception {
        mockMvc.perform(post("/api/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "category", "Technical",
                        "priority", "High",
                        "subject", "Test ticket",
                        "description", "Test description"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("BB-TICKET-02: POST /api/tickets - with valid token creates ticket")
    void createTicket_withAuth() throws Exception {
        // Setup: register, verify, login
        String token = registerVerifyAndLogin("ticket-user@example.com", "Ticket User", "Abcdef1!");

        mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "category", "Technical",
                        "priority", "High",
                        "subject", "App crashes on login",
                        "description", "The application crashes when I try to log in."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("App crashes on login"))
                .andExpect(jsonPath("$.status").value("open"))
                .andExpect(jsonPath("$.category").value("Technical"));
    }

    @Test
    @DisplayName("BB-TICKET-03: GET /api/tickets - returns user's tickets")
    void getTickets_withAuth() throws Exception {
        String token = registerVerifyAndLogin("list-user@example.com", "List User", "Abcdef1!");

        // Create a ticket first
        mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "category", "Billing",
                        "priority", "Medium",
                        "subject", "Billing question",
                        "description", "I have a billing issue."))));

        // Get tickets
        mockMvc.perform(get("/api/tickets")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject").value("Billing question"));
    }

    @Test
    @DisplayName("BB-TICKET-04: GET /api/tickets/dashboard - returns stats")
    void getDashboard() throws Exception {
        String token = registerVerifyAndLogin("dash-user@example.com", "Dash User", "Abcdef1!");

        mockMvc.perform(get("/api/tickets/dashboard")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTickets").exists())
                .andExpect(jsonPath("$.openTickets").exists());
    }

    @Test
    @DisplayName("BB-TICKET-05: PUT /api/tickets/{id}/status - close a ticket")
    void updateTicketStatus() throws Exception {
        String token = registerVerifyAndLogin("status-user@example.com", "Status User", "Abcdef1!");

        // Create ticket
        String createResponse = mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "category", "General",
                        "priority", "Low",
                        "subject", "Close me",
                        "description", "Test closing."))))
                .andReturn().getResponse().getContentAsString();

        Long ticketId = objectMapper.readTree(createResponse).get("id").asLong();

        // Close ticket
        mockMvc.perform(put("/api/tickets/" + ticketId + "/status")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "closed"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("closed"));
    }

    // ==================== HELPER ====================

    private String registerVerifyAndLogin(String email, String fullName, String password) throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", fullName,
                        "email", email,
                        "password", password))));

        // Wait for async OTP send to complete/fail before generating our own
        Thread.sleep(500);

        // Verify OTP
        String otp = otpService.generateOtp(email);
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", email,
                        "otp", otp))));

        // Login and extract token
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", email,
                        "password", password))))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(loginResponse).get("token").asText();
    }
}
