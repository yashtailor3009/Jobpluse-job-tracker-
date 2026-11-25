package com.jobtracker.dto;

public class MonthlyApplicationCount {
    private String month; // e.g. "2026-05" or "May 2026"
    private long count;

    public MonthlyApplicationCount() {
    }

    public MonthlyApplicationCount(String month, long count) {
        this.month = month;
        this.count = count;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
