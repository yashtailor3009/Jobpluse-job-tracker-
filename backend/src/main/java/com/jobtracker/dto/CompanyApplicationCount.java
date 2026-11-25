package com.jobtracker.dto;

public class CompanyApplicationCount {
    private String companyName;
    private long count;

    public CompanyApplicationCount() {
    }

    public CompanyApplicationCount(String companyName, long count) {
        this.companyName = companyName;
        this.count = count;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
