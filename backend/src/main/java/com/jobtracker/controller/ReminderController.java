package com.jobtracker.controller;

import com.jobtracker.dto.DeadlineReminderResponse;
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
@RequestMapping("/api/reminders")
@Tag(name = "Deadline Reminders", description = "Reminders for pending application deadlines and overdue notices")
public class ReminderController {

    private final AnalyticsService analyticsService;

    public ReminderController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/deadlines")
    @Operation(summary = "Get list of upcoming and overdue application deadlines")
    public ResponseEntity<List<DeadlineReminderResponse>> getDeadlineReminders(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DeadlineReminderResponse> list = analyticsService.getDeadlineReminders(principal.getId());
        return ResponseEntity.ok(list);
    }
}
