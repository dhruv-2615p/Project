package com.customersupport.auth.service;

import com.customersupport.auth.dto.AuthResponse;
import com.customersupport.auth.dto.LoginRequest;
import com.customersupport.auth.dto.RegisterRequest;
import com.customersupport.auth.entity.User;
import com.customersupport.auth.repository.UserRepository;
import com.customersupport.auth.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil, OtpService otpService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);
        userRepository.save(user);

        // Send OTP asynchronously so the registration response is not delayed by SMTP
        final String email = request.getEmail();
        CompletableFuture.runAsync(() -> {
            try {
                sendOtpToEmail(email);
            } catch (Exception e) {
                log.error("Async OTP send failed for {}: {}", email, e.getMessage());
            }
        });

        return new AuthResponse(null, user.getFullName(), user.getEmail());
    }

    public void sendOtpToEmail(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email not registered");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        try {
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again later.");
        }
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        if (!otpService.verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email first.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getFullName(), user.getEmail());
    }

    public AuthResponse validateToken(String token) {
        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new AuthResponse(token, user.getFullName(), user.getEmail());
    }
}
