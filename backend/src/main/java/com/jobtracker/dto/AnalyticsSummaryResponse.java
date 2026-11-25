package com.jobtracker.dto;

public class AnalyticsSummaryResponse {

    private long totalApplications;
    private long activeInterviews;
    private long offersCount;
    private long rejectedCount;
    private double interviewRate; // percentage
    private double offerRate;     // percentage
    private double rejectionRate; // percentage
    private long upcomingDeadlinesCount;

    public AnalyticsSummaryResponse() {
    }

    public AnalyticsSummaryResponse(long totalApplications, long activeInterviews, long offersCount,
                                    long rejectedCount, double interviewRate, double offerRate,
                                    double rejectionRate, long upcomingDeadlinesCount) {
        this.totalApplications = totalApplications;
        this.activeInterviews = activeInterviews;
        this.offersCount = offersCount;
        this.rejectedCount = rejectedCount;
        this.interviewRate = interviewRate;
        this.offerRate = offerRate;
        this.rejectionRate = rejectionRate;
        this.upcomingDeadlinesCount = upcomingDeadlinesCount;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getActiveInterviews() {
        return activeInterviews;
    }

    public void setActiveInterviews(long activeInterviews) {
        this.activeInterviews = activeInterviews;
    }

    public long getOffersCount() {
        return offersCount;
    }

    public void setOffersCount(long offersCount) {
        this.offersCount = offersCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public double getInterviewRate() {
        return interviewRate;
    }

    public void setInterviewRate(double interviewRate) {
        this.interviewRate = interviewRate;
    }

    public double getOfferRate() {
        return offerRate;
    }

    public void setOfferRate(double offerRate) {
        this.offerRate = offerRate;
    }

    public double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }

    public long getUpcomingDeadlinesCount() {
        return upcomingDeadlinesCount;
    }

    public void setUpcomingDeadlinesCount(long upcomingDeadlinesCount) {
        this.upcomingDeadlinesCount = upcomingDeadlinesCount;
    }
}
