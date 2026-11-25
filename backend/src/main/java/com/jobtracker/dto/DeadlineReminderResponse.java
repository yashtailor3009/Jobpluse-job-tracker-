package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;
import java.time.LocalDate;

public class DeadlineReminderResponse {

    private Long applicationId;
    private String companyName;
    private String jobTitle;
    private LocalDate deadline;
    private long daysRemaining;
    private ApplicationStatus status;
    private String urgency; // "OVERDUE", "TODAY", "URGENT", "UPCOMING"

    public DeadlineReminderResponse() {
    }

    public DeadlineReminderResponse(Long applicationId, String companyName, String jobTitle,
                                    LocalDate deadline, long daysRemaining, ApplicationStatus status, String urgency) {
        this.applicationId = applicationId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.deadline = deadline;
        this.daysRemaining = daysRemaining;
        this.status = status;
        this.urgency = urgency;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
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

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }
}
