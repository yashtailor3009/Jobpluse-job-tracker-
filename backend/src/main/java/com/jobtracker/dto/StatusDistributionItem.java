package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;

public class StatusDistributionItem {
    private ApplicationStatus status;
    private long count;
    private double percentage;

    public StatusDistributionItem() {
    }

    public StatusDistributionItem(ApplicationStatus status, long count, double percentage) {
        this.status = status;
        this.count = count;
        this.percentage = percentage;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
