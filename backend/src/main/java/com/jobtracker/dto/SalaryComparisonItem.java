package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;

public class SalaryComparisonItem {
    private String companyName;
    private String jobTitle;
    private int minSalary;
    private int maxSalary;
    private int avgSalary;
    private String rawSalary;
    private ApplicationStatus status;

    public SalaryComparisonItem() {
    }

    public SalaryComparisonItem(String companyName, String jobTitle, int minSalary, int maxSalary,
                                int avgSalary, String rawSalary, ApplicationStatus status) {
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
        this.avgSalary = avgSalary;
        this.rawSalary = rawSalary;
        this.status = status;
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

    public int getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(int minSalary) {
        this.minSalary = minSalary;
    }

    public int getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(int maxSalary) {
        this.maxSalary = maxSalary;
    }

    public int getAvgSalary() {
        return avgSalary;
    }

    public void setAvgSalary(int avgSalary) {
        this.avgSalary = avgSalary;
    }

    public String getRawSalary() {
        return rawSalary;
    }

    public void setRawSalary(String rawSalary) {
        this.rawSalary = rawSalary;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
