package com.jobtracker.service;

import com.jobtracker.dto.*;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final JobApplicationRepository applicationRepository;

    public AnalyticsService(JobApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(Long userId) {
        long total = applicationRepository.countByUserId(userId);
        long applied = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);
        long assessment = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.ASSESSMENT);
        long interview = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        long offer = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER);
        long rejected = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);

        LocalDate today = LocalDate.now();
        List<JobApplication> upcoming = applicationRepository.findUpcomingDeadlines(userId, today);
        long upcomingDeadlinesCount = upcoming.size();

        double interviewRate = 0.0;
        double offerRate = 0.0;
        double rejectionRate = 0.0;

        if (total > 0) {
            // Reached interview stage includes both active interviews and those that converted to offers
            long interviewedOrOffered = interview + offer;
            interviewRate = round((double) interviewedOrOffered / total * 100);
            offerRate = round((double) offer / total * 100);
            rejectionRate = round((double) rejected / total * 100);
        }

        return new AnalyticsSummaryResponse(
                total,
                interview,
                offer,
                rejected,
                interviewRate,
                offerRate,
                rejectionRate,
                upcomingDeadlinesCount
        );
    }

    @Transactional(readOnly = true)
    public List<MonthlyApplicationCount> getMonthlyApplicationCounts(Long userId) {
        List<LocalDate> dates = applicationRepository.findAllApplicationDates(userId);

        DateTimeFormatter keyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        // Count per year-month
        Map<String, Long> countMap = new TreeMap<>();
        Map<String, String> displayMap = new HashMap<>();

        for (LocalDate date : dates) {
            if (date != null) {
                String key = date.format(keyFormatter);
                countMap.put(key, countMap.getOrDefault(key, 0L) + 1);
                displayMap.put(key, date.format(displayFormatter));
            }
        }

        List<MonthlyApplicationCount> result = new ArrayList<>();
        for (Map.Entry<String, Long> entry : countMap.entrySet()) {
            result.add(new MonthlyApplicationCount(displayMap.get(entry.getKey()), entry.getValue()));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<StatusDistributionItem> getStatusDistribution(Long userId) {
        long total = applicationRepository.countByUserId(userId);
        List<Object[]> rawCounts = applicationRepository.countApplicationsByStatusGroup(userId);

        Map<ApplicationStatus, Long> countsByStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            countsByStatus.put(status, 0L);
        }

        for (Object[] row : rawCounts) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            countsByStatus.put(status, count);
        }

        List<StatusDistributionItem> distribution = new ArrayList<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = countsByStatus.get(status);
            double pct = total > 0 ? round((double) count / total * 100) : 0.0;
            distribution.add(new StatusDistributionItem(status, count, pct));
        }

        return distribution;
    }

    @Transactional(readOnly = true)
    public List<CompanyApplicationCount> getTopCompanies(Long userId) {
        List<Object[]> rawList = applicationRepository.findTopCompaniesByApplicationCount(userId);
        return rawList.stream()
                .limit(10)
                .map(row -> new CompanyApplicationCount((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeadlineReminderResponse> getDeadlineReminders(Long userId) {
        LocalDate today = LocalDate.now();
        List<JobApplication> upcoming = applicationRepository.findUpcomingDeadlines(userId, today);
        List<JobApplication> overdue = applicationRepository.findOverdueDeadlines(userId, today);

        List<DeadlineReminderResponse> reminders = new ArrayList<>();

        // Add overdue first
        for (JobApplication app : overdue) {
            long days = ChronoUnit.DAYS.between(today, app.getDeadline());
            reminders.add(new DeadlineReminderResponse(
                    app.getId(),
                    app.getCompanyName(),
                    app.getJobTitle(),
                    app.getDeadline(),
                    days,
                    app.getStatus(),
                    "OVERDUE"
            ));
        }

        // Add upcoming
        for (JobApplication app : upcoming) {
            long days = ChronoUnit.DAYS.between(today, app.getDeadline());
            String urgency;
            if (days == 0) {
                urgency = "TODAY";
            } else if (days <= 3) {
                urgency = "URGENT";
            } else {
                urgency = "UPCOMING";
            }

            reminders.add(new DeadlineReminderResponse(
                    app.getId(),
                    app.getCompanyName(),
                    app.getJobTitle(),
                    app.getDeadline(),
                    days,
                    app.getStatus(),
                    urgency
            ));
        }

        return reminders;
    }

    @Transactional(readOnly = true)
    public List<SalaryComparisonItem> getSalaryComparison(Long userId) {
        List<JobApplication> apps = applicationRepository.findByUserId(userId, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
        List<SalaryComparisonItem> list = new ArrayList<>();

        for (JobApplication app : apps) {
            String salary = app.getSalaryRange();
            if (salary != null && !salary.trim().isEmpty()) {
                int[] range = parseSalaryRange(salary);
                if (range != null) {
                    list.add(new SalaryComparisonItem(
                            app.getCompanyName(),
                            app.getJobTitle(),
                            range[0],
                            range[1],
                            (range[0] + range[1]) / 2,
                            salary,
                            app.getStatus()
                    ));
                }
            }
        }
        return list;
    }

    private int[] parseSalaryRange(String s) {
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,6})").matcher(s);
            List<Integer> nums = new ArrayList<>();
            while (m.find()) {
                String clean = m.group(1).replace(",", "");
                nums.add(Integer.parseInt(clean));
            }
            if (nums.size() >= 2) {
                return new int[]{nums.get(0), nums.get(1)};
            } else if (nums.size() == 1) {
                return new int[]{nums.get(0), nums.get(0)};
            }
        } catch (Exception ignored) {}
        return null;
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
