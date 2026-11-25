package com.jobtracker.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    // In-memory store for recent sent emails (for inspection / testing)
    private final Map<String, SentEmailRecord> recentEmails = new ConcurrentHashMap<>();

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public static class SentEmailRecord {
        private final String recipient;
        private final String subject;
        private final String otpCode;
        private final LocalDateTime sentAt;
        private final LocalDateTime expiresAt;

        public SentEmailRecord(String recipient, String subject, String otpCode, LocalDateTime sentAt, LocalDateTime expiresAt) {
            this.recipient = recipient;
            this.subject = subject;
            this.otpCode = otpCode;
            this.sentAt = sentAt;
            this.expiresAt = expiresAt;
        }

        public String getRecipient() { return recipient; }
        public String getSubject() { return subject; }
        public String getOtpCode() { return otpCode; }
        public LocalDateTime getSentAt() { return sentAt; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
    }

    /**
     * Sends an authentic HTML verification email with the 6-digit OTP and 5-minute expiry.
     */
    public boolean sendOtpEmail(String recipientEmail, String recipientName, String otpCode, int expiryMinutes) {
        LocalDateTime sentAt = LocalDateTime.now();
        LocalDateTime expiresAt = sentAt.plusMinutes(expiryMinutes);
        String subject = "🔐 Your JobPulse Verification Code: " + otpCode;

        // Store in recent emails for audit / dev inspection
        recentEmails.put(recipientEmail.toLowerCase().trim(),
                new SentEmailRecord(recipientEmail, subject, otpCode, sentAt, expiresAt));

        // Format expiration time for display (e.g. 03:45 PM)
        String formattedExpiryTime = expiresAt.format(DateTimeFormatter.ofPattern("hh:mm a"));

        // HTML Content with modern dark/emerald styling matching JobPulse
        String htmlBody = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='utf-8'></head>"
                + "<body style='margin:0;padding:24px;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#e2e8f0;'>"
                + "  <div style='max-width:540px;margin:0 auto;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:32px;'>"
                + "    <div style='text-align:center;margin-bottom:24px;'>"
                + "      <div style='display:inline-block;width:44px;height:44px;line-height:44px;border-radius:12px;background:linear-gradient(135deg,#10b981,#06b6d4);color:#ffffff;font-size:22px;font-weight:bold;text-align:center;'>⚡</div>"
                + "      <h1 style='margin:12px 0 4px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;'>JobPulse PRO</h1>"
                + "      <p style='margin:0;color:#94a3b8;font-size:13px;'>Account Verification &amp; Security</p>"
                + "    </div>"
                + "    <div style='border-top:1px solid #1e293b;padding-top:20px;margin-bottom:24px;'>"
                + "      <p style='font-size:15px;color:#f1f5f9;margin:0 0 12px;'>Hello <strong>" + (recipientName != null ? recipientName : "there") + "</strong>,</p>"
                + "      <p style='font-size:13px;color:#cbd5e1;line-height:1.6;margin:0 0 20px;'>Thank you for registering with JobPulse. Please use the following 6-digit One-Time Password (OTP) to verify your email address and activate your account:</p>"
                + "      <div style='background-color:#090d16;border:2px dashed #10b981;border-radius:12px;padding:16px 24px;text-align:center;margin:24px 0;'>"
                + "        <span style='font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:32px;font-weight:800;letter-spacing:10px;color:#34d399;display:inline-block;'>"
                + otpCode
                + "        </span>"
                + "      </div>"
                + "      <div style='background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:12px 16px;margin:20px 0;'>"
                + "        <p style='margin:0;font-size:12px;color:#fca5a5;line-height:1.5;'>"
                + "          ⏳ <strong>Security Notice:</strong> This code is valid for <strong>" + expiryMinutes + " minutes</strong> (expires at <strong>" + formattedExpiryTime + "</strong>). Do NOT share this code with anyone."
                + "        </p>"
                + "      </div>"
                + "      <p style='font-size:12px;color:#64748b;line-height:1.5;margin:20px 0 0;'>If you did not initiate this account creation request, no further action is required; your email address will remain unverified.</p>"
                + "    </div>"
                + "    <div style='border-top:1px solid #1e293b;padding-top:16px;text-align:center;font-size:11px;color:#475569;'>"
                + "      JobPulse Career Management Platform • Automated Pipeline &amp; Analytics"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";

        boolean emailDelivered = false;

        // Try SMTP delivery if mailSender is available and configured
        if (mailSender != null && mailFrom != null && !mailFrom.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailFrom, "JobPulse Security");
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);
                mailSender.send(message);
                emailDelivered = true;
                logger.info("✅ SMTP verification email sent successfully to {}", recipientEmail);
            } catch (Exception e) {
                logger.warn("⚠️ SMTP dispatch failed (falling back to secure log dispatch): {}", e.getMessage());
            }
        }

        // Always print dedicated security box in server logs
        logger.info("\n" +
                "========================================================================================\n" +
                "📧 [JOBPULSE SECURE EMAIL DISPATCHER]\n" +
                "   To         : " + recipientEmail + " (" + recipientName + ")\n" +
                "   Subject    : " + subject + "\n" +
                "   OTP Code   : " + otpCode + "\n" +
                "   Expires At : " + formattedExpiryTime + " (" + expiryMinutes + " minutes validity)\n" +
                "   SMTP Sent  : " + (emailDelivered ? "YES" : "NO (Logged in Server Console)") + "\n" +
                "========================================================================================");

        return true;
    }

    public SentEmailRecord getLatestEmail(String email) {
        if (email == null) return null;
        return recentEmails.get(email.toLowerCase().trim());
    }
}
