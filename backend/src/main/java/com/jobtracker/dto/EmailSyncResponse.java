package com.jobtracker.dto;

public class EmailSyncResponse {

    private String actionType; // APPLICATION_CONFIRMED, INTERVIEW_SCHEDULED, DEADLINE_DETECTED, OFFER_RECEIVED, PARSED_INFO
    private String companyName;
    private String jobTitle;
    private String status;
    private String meetingLink;
    private String scheduledAt;
    private String deadline;
    private String salaryExtracted;
    private String message;
    private Long applicationId;
    private Long interviewId;

    public EmailSyncResponse() {
    }

    public EmailSyncResponse(String actionType, String companyName, String jobTitle, String status,
                             String meetingLink, String scheduledAt, String deadline,
                             String salaryExtracted, String message, Long applicationId, Long interviewId) {
        this.actionType = actionType;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.status = status;
        this.meetingLink = meetingLink;
        this.scheduledAt = scheduledAt;
        this.deadline = deadline;
        this.salaryExtracted = salaryExtracted;
        this.message = message;
        this.applicationId = applicationId;
        this.interviewId = interviewId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(String scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getSalaryExtracted() {
        return salaryExtracted;
    }

    public void setSalaryExtracted(String salaryExtracted) {
        this.salaryExtracted = salaryExtracted;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }
}
