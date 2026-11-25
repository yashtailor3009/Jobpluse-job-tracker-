package com.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;

public class EmailSyncRequest {

    private String sender;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Email body is required")
    private String body;

    private String receivedAt;

    public EmailSyncRequest() {
    }

    public EmailSyncRequest(String sender, String subject, String body, String receivedAt) {
        this.sender = sender;
        this.subject = subject;
        this.body = body;
        this.receivedAt = receivedAt;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(String receivedAt) {
        this.receivedAt = receivedAt;
    }
}
