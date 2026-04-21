package com.customersupport.auth.whitebox;

import com.customersupport.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * WHITE BOX TESTS - JwtUtil
 * Tests JWT token generation, email extraction, and validation logic.
 */
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String SECRET = "test-jwt-secret-key-must-be-at-least-256-bits-long-for-hs256-algorithm";
    private static final long EXPIRATION = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION);
    }

    @Test
    @DisplayName("WB-JWT-01: generateToken returns non-null token")
    void generateToken_returnsToken() {
        String token = jwtUtil.generateToken("user@test.com");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("WB-JWT-02: extractEmail returns correct email from token")
    void extractEmail_correctEmail() {
        String token = jwtUtil.generateToken("user@test.com");
        String email = jwtUtil.extractEmail(token);
        assertEquals("user@test.com", email);
    }

    @Test
    @DisplayName("WB-JWT-03: isTokenValid returns true for valid token")
    void isTokenValid_validToken() {
        String token = jwtUtil.generateToken("user@test.com");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    @DisplayName("WB-JWT-04: isTokenValid returns false for tampered token")
    void isTokenValid_tamperedToken() {
        String token = jwtUtil.generateToken("user@test.com");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtUtil.isTokenValid(tampered));
    }

    @Test
    @DisplayName("WB-JWT-05: isTokenValid returns false for empty string")
    void isTokenValid_emptyToken() {
        assertFalse(jwtUtil.isTokenValid(""));
    }

    @Test
    @DisplayName("WB-JWT-06: isTokenValid returns false for garbage input")
    void isTokenValid_garbage() {
        assertFalse(jwtUtil.isTokenValid("not.a.valid.jwt.token"));
    }

    @Test
    @DisplayName("WB-JWT-07: Token signed with different secret is rejected")
    void isTokenValid_differentSecret() {
        String token = jwtUtil.generateToken("user@test.com");
        JwtUtil otherUtil = new JwtUtil(
                "different-secret-key-must-be-at-least-256-bits-long-for-hs256-algorithm", EXPIRATION);
        assertFalse(otherUtil.isTokenValid(token));
    }

    @Test
    @DisplayName("WB-JWT-08: Expired token is invalid")
    void isTokenValid_expiredToken() {
        // 0 ms expiration = immediately expired
        JwtUtil expiredJwtUtil = new JwtUtil(SECRET, 0);
        String token = expiredJwtUtil.generateToken("user@test.com");
        assertFalse(expiredJwtUtil.isTokenValid(token));
    }

    @Test
    @DisplayName("WB-JWT-09: Tokens for different emails are unique")
    void generateToken_uniquePerEmail() {
        String token1 = jwtUtil.generateToken("a@test.com");
        String token2 = jwtUtil.generateToken("b@test.com");
        assertNotEquals(token1, token2);
    }
}
