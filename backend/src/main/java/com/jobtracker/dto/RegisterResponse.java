package com.jobtracker.dto;

public class RegisterResponse {

    private String message;
    private String email;
    private boolean requiresOtp;
    private int expiryMinutes = 2;

    public RegisterResponse() {
    }

    public RegisterResponse(String message, String email, boolean requiresOtp) {
        this.message = message;
        this.email = email;
        this.requiresOtp = requiresOtp;
        this.expiryMinutes = 2;
    }

    public RegisterResponse(String message, String email, boolean requiresOtp, int expiryMinutes) {
        this.message = message;
        this.email = email;
        this.requiresOtp = requiresOtp;
        this.expiryMinutes = expiryMinutes;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isRequiresOtp() {
        return requiresOtp;
    }

    public void setRequiresOtp(boolean requiresOtp) {
        this.requiresOtp = requiresOtp;
    }

    public int getExpiryMinutes() {
        return expiryMinutes;
    }

    public void setExpiryMinutes(int expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
    }
}
