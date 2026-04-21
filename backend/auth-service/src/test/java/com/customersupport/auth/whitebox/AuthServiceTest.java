package com.customersupport.auth.whitebox;

import com.customersupport.auth.dto.AuthResponse;
import com.customersupport.auth.dto.LoginRequest;
import com.customersupport.auth.dto.RegisterRequest;
import com.customersupport.auth.entity.User;
import com.customersupport.auth.repository.UserRepository;
import com.customersupport.auth.service.AuthService;
import com.customersupport.auth.service.EmailService;
import com.customersupport.auth.service.OtpService;
import com.customersupport.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * WHITE BOX TESTS - AuthService
 * Tests business logic with mocked dependencies (repository, encoder, JWT, OTP,
 * email).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private OtpService otpService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User existingUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@test.com");
        registerRequest.setPassword("Abcdef1!");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("Abcdef1!");

        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setFullName("John Doe");
        existingUser.setEmail("john@test.com");
        existingUser.setPassword("encoded-password");
        existingUser.setEmailVerified(true);
    }

    // ==================== REGISTER ====================

    @Test
    @DisplayName("WB-AUTH-01: Register creates new user and returns response")
    void register_success() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Abcdef1!")).thenReturn("encoded-pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals("john@test.com", response.getEmail());
        assertNull(response.getToken()); // No token at registration
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("WB-AUTH-02: Register throws for duplicate verified email")
    void register_duplicateVerifiedEmail() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));
        assertTrue(ex.getMessage().contains("already registered"));
    }

    @Test
    @DisplayName("WB-AUTH-03: Register throws for unverified duplicate with hint")
    void register_duplicateUnverifiedEmail() {
        existingUser.setEmailVerified(false);
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));
        assertTrue(ex.getMessage().contains("not verified"));
    }

    // ==================== LOGIN ====================

    @Test
    @DisplayName("WB-AUTH-04: Login returns token for valid verified user")
    void login_success() {
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Abcdef1!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken("john@test.com")).thenReturn("jwt-token-xyz");

        AuthResponse response = authService.login(loginRequest);

        assertEquals("jwt-token-xyz", response.getToken());
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    @DisplayName("WB-AUTH-05: Login throws for wrong password")
    void login_wrongPassword() {
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Abcdef1!", "encoded-password")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));
        assertTrue(ex.getMessage().contains("Invalid email or password"));
    }

    @Test
    @DisplayName("WB-AUTH-06: Login throws for non-existent user")
    void login_userNotFound() {
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("WB-AUTH-07: Login throws for unverified email")
    void login_emailNotVerified() {
        existingUser.setEmailVerified(false);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Abcdef1!", "encoded-password")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));
        assertTrue(ex.getMessage().contains("not verified"));
    }

    // ==================== VERIFY OTP ====================

    @Test
    @DisplayName("WB-AUTH-08: verifyOtp sets emailVerified=true")
    void verifyOtp_success() {
        existingUser.setEmailVerified(false);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));
        when(otpService.verifyOtp("john@test.com", "123456")).thenReturn(true);

        authService.verifyOtp("john@test.com", "123456");

        assertTrue(existingUser.isEmailVerified());
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("WB-AUTH-09: verifyOtp throws for invalid OTP")
    void verifyOtp_invalidOtp() {
        existingUser.setEmailVerified(false);
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));
        when(otpService.verifyOtp("john@test.com", "000000")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.verifyOtp("john@test.com", "000000"));
        assertTrue(ex.getMessage().contains("Invalid or expired OTP"));
    }

    // ==================== TOKEN VALIDATION ====================

    @Test
    @DisplayName("WB-AUTH-10: validateToken returns user info for valid token")
    void validateToken_success() {
        when(jwtUtil.isTokenValid("valid-token")).thenReturn(true);
        when(jwtUtil.extractEmail("valid-token")).thenReturn("john@test.com");
        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.validateToken("valid-token");

        assertEquals("John Doe", response.getFullName());
        assertEquals("john@test.com", response.getEmail());
    }

    @Test
    @DisplayName("WB-AUTH-11: validateToken throws for invalid token")
    void validateToken_invalid() {
        when(jwtUtil.isTokenValid("bad-token")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.validateToken("bad-token"));
    }

    // ==================== RESET PASSWORD ====================

    @Test
    @DisplayName("WB-AUTH-12: resetPassword updates password and clears token")
    void resetPassword_success() {
        existingUser.setResetToken("reset-uuid");
        existingUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByResetToken("reset-uuid")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("NewPass1!")).thenReturn("new-encoded-pass");

        authService.resetPassword("reset-uuid", "NewPass1!");

        assertEquals("new-encoded-pass", existingUser.getPassword());
        assertNull(existingUser.getResetToken());
        assertNull(existingUser.getResetTokenExpiry());
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("WB-AUTH-13: resetPassword throws for expired token")
    void resetPassword_expiredToken() {
        existingUser.setResetToken("reset-uuid");
        existingUser.setResetTokenExpiry(LocalDateTime.now().minusMinutes(1)); // expired
        when(userRepository.findByResetToken("reset-uuid")).thenReturn(Optional.of(existingUser));

        assertThrows(RuntimeException.class,
                () -> authService.resetPassword("reset-uuid", "NewPass1!"));
    }
}
