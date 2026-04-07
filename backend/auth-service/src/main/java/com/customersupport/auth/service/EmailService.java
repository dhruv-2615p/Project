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
        message.setSubject("DRP AI Customer Support - Email Verification OTP");
        message.setText("Your OTP for email verification is: " + otp
                + "\n\nThis code is valid for 5 minutes."
                + "\n\nIf you did not request this, please ignore this email.");
        mailSender.send(message);
    }

    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("p9806531@gmail.com");
        message.setTo(toEmail);
        message.setSubject("DRP AI Customer Support - Password Reset");
        message.setText("Hello,\n\nYou have requested to reset your password."
                + "\n\nClick the link below to reset your password:\n" + resetLink
                + "\n\nThis link is valid for 15 minutes."
                + "\n\nIf you did not request this, please ignore this email."
                + "\n\nBest regards,\nDRP AI Customer Support Team");
        mailSender.send(message);
    }
}
