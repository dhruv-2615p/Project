package com.customersupport.auth.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("p9806531@gmail.com");
        message.setTo(toEmail);
        message.setSubject("AI Customer Support - Email Verification OTP");
        message.setText("Your OTP for email verification is: " + otp
                + "\n\nThis code is valid for 5 minutes."
                + "\n\nIf you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}
