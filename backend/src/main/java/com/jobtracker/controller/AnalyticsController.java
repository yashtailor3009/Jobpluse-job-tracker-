package com.jobtracker.controller;

import com.jobtracker.dto.AnalyticsSummaryResponse;
import com.jobtracker.dto.CompanyApplicationCount;
import com.jobtracker.dto.MonthlyApplicationCount;
import com.jobtracker.dto.SalaryComparisonItem;
import com.jobtracker.dto.StatusDistributionItem;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Career Analytics", description = "Career and application metrics, charts and conversion funnels")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get overall KPI summary including interview, offer, and rejection rates")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        AnalyticsSummaryResponse summary = analyticsService.getSummary(principal.getId());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get applications count grouped by month")
    public ResponseEntity<List<MonthlyApplicationCount>> getMonthlyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MonthlyApplicationCount> list = analyticsService.getMonthlyApplicationCounts(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/status-breakdown")
    @Operation(summary = "Get breakdown and percentage of applications per status")
    public ResponseEntity<List<StatusDistributionItem>> getStatusDistribution(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StatusDistributionItem> list = analyticsService.getStatusDistribution(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/top-companies")
    @Operation(summary = "Get top companies applied to")
    public ResponseEntity<List<CompanyApplicationCount>> getTopCompanies(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CompanyApplicationCount> list = analyticsService.getTopCompanies(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/salaries")
    @Operation(summary = "Get parsed salary ranges and comparison across job applications")
    public ResponseEntity<List<SalaryComparisonItem>> getSalaryComparison(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SalaryComparisonItem> list = analyticsService.getSalaryComparison(principal.getId());
        return ResponseEntity.ok(list);
    }
}
