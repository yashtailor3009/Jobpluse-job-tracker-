package com.jobtracker.controller;

import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.dto.InterviewResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@Tag(name = "Interviews", description = "Interview scheduling and outcome management")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @Operation(summary = "Schedule a new interview round")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InterviewRequest request) {
        InterviewResponse response = interviewService.createInterview(principal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all interviews for the user ordered by schedule date")
    public ResponseEntity<List<InterviewResponse>> getAllInterviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InterviewResponse> list = interviewService.getInterviews(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "List upcoming interviews scheduled from now onwards")
    public ResponseEntity<List<InterviewResponse>> getUpcomingInterviews(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InterviewResponse> list = interviewService.getUpcomingInterviews(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an interview round details or outcome")
    public ResponseEntity<InterviewResponse> updateInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request) {
        InterviewResponse response = interviewService.updateInterview(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete / cancel a scheduled interview round")
    public ResponseEntity<Void> deleteInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        interviewService.deleteInterview(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
