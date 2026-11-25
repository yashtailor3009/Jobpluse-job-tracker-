package com.jobtracker.dto;

import com.jobtracker.entity.InterviewOutcome;
import com.jobtracker.entity.RoundType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class InterviewRequest {

    private Long jobApplicationId;

    @NotNull(message = "Round type is required")
    private RoundType roundType;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    private String meetingLink;
    private String interviewer;
    private String notes;
    private InterviewOutcome outcome = InterviewOutcome.PENDING;

    public InterviewRequest() {
    }

    public Long getJobApplicationId() {
        return jobApplicationId;
    }

    public void setJobApplicationId(Long jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
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
}
