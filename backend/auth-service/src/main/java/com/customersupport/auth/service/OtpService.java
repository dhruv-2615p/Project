package com.customersupport.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final int expiryMinutes;

    public OtpService(@Value("${otp.expiry.minutes:5}") int expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1000000));
        otpStore.put(email, new OtpEntry(otp, LocalDateTime.now().plusMinutes(expiryMinutes)));
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;
        if (entry.expiresAt.isBefore(LocalDateTime.now())) {
            otpStore.remove(email);
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(email);
            return true;
        }
        return false;
    }

    private record OtpEntry(String otp, LocalDateTime expiresAt) {}
}
