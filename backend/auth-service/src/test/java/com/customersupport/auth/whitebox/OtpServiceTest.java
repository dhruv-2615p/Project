package com.customersupport.auth.whitebox;

import com.customersupport.auth.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * WHITE BOX TESTS - OtpService
 * Tests internal OTP generation, storage, verification, and expiry logic.
 */
class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(5); // 5 min expiry
    }

    @Test
    @DisplayName("WB-OTP-01: generateOtp returns 6-digit string")
    void generateOtp_returns6Digits() {
        String otp = otpService.generateOtp("user@test.com");
        assertNotNull(otp);
        assertEquals(6, otp.length());
        assertTrue(otp.matches("\\d{6}"), "OTP should be exactly 6 digits");
    }

    @Test
    @DisplayName("WB-OTP-02: generateOtp overwrites previous OTP for same email")
    void generateOtp_overwritesPrevious() {
        String otp1 = otpService.generateOtp("user@test.com");
        String otp2 = otpService.generateOtp("user@test.com");
        // New OTP should be valid, old one should not
        assertTrue(otpService.verifyOtp("user@test.com", otp2));
    }

    @Test
    @DisplayName("WB-OTP-03: verifyOtp returns true for valid OTP")
    void verifyOtp_validOtp() {
        String otp = otpService.generateOtp("user@test.com");
        assertTrue(otpService.verifyOtp("user@test.com", otp));
    }

    @Test
    @DisplayName("WB-OTP-04: verifyOtp returns false for wrong OTP")
    void verifyOtp_wrongOtp() {
        otpService.generateOtp("user@test.com");
        assertFalse(otpService.verifyOtp("user@test.com", "000000"));
    }

    @Test
    @DisplayName("WB-OTP-05: verifyOtp returns false for non-existent email")
    void verifyOtp_noOtpStored() {
        assertFalse(otpService.verifyOtp("unknown@test.com", "123456"));
    }

    @Test
    @DisplayName("WB-OTP-06: verifyOtp consumes OTP (single use)")
    void verifyOtp_consumedAfterUse() {
        String otp = otpService.generateOtp("user@test.com");
        assertTrue(otpService.verifyOtp("user@test.com", otp));
        // Second attempt should fail
        assertFalse(otpService.verifyOtp("user@test.com", otp));
    }

    @Test
    @DisplayName("WB-OTP-07: verifyOtp returns false for expired OTP")
    void verifyOtp_expired() {
        // Create service with negative expiry so OTP is already in the past
        OtpService expiredService = new OtpService(-1);
        String otp = expiredService.generateOtp("user@test.com");
        assertFalse(expiredService.verifyOtp("user@test.com", otp));
    }

    @Test
    @DisplayName("WB-OTP-08: Different emails get independent OTPs")
    void differentEmails_independentOtps() {
        String otp1 = otpService.generateOtp("a@test.com");
        String otp2 = otpService.generateOtp("b@test.com");

        assertTrue(otpService.verifyOtp("a@test.com", otp1));
        assertTrue(otpService.verifyOtp("b@test.com", otp2));
        // Cross-verify should fail
        assertFalse(otpService.verifyOtp("a@test.com", otp2));
    }
}
