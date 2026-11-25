package com.jobtracker.dto;

import com.jobtracker.entity.InterviewOutcome;
import com.jobtracker.entity.RoundType;
import java.time.LocalDateTime;

public class InterviewResponse {

    private Long id;
    private Long jobApplicationId;
    private String companyName;
    private String jobTitle;
    private RoundType roundType;
    private LocalDateTime scheduledAt;
    private String meetingLink;
    private String interviewer;
    private String notes;
    private InterviewOutcome outcome;
    private LocalDateTime createdAt;

    public InterviewResponse() {
    }

    public InterviewResponse(Long id, Long jobApplicationId, String companyName, String jobTitle,
                             RoundType roundType, LocalDateTime scheduledAt, String meetingLink,
                             String interviewer, String notes, InterviewOutcome outcome, LocalDateTime createdAt) {
        this.id = id;
        this.jobApplicationId = jobApplicationId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.roundType = roundType;
        this.scheduledAt = scheduledAt;
        this.meetingLink = meetingLink;
        this.interviewer = interviewer;
        this.notes = notes;
        this.outcome = outcome;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobApplicationId() {
        return jobApplicationId;
    }

    public void setJobApplicationId(Long jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
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

    public RoundType getRoundType() {
        return roundType;
    }

    public void setRoundType(RoundType roundType) {
        this.roundType = roundType;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getInterviewer() {
        return interviewer;
    }

    public void setInterviewer(String interviewer) {
        this.interviewer = interviewer;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public InterviewOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(InterviewOutcome outcome) {
        this.outcome = outcome;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
