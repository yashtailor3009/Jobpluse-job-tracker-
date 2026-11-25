package com.jobtracker.controller;

import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.dto.StatusUpdateRequest;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.Priority;
import com.jobtracker.entity.WorkType;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Job Applications", description = "CRUD and status management for job applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @Operation(summary = "Create a new job application")
    public ResponseEntity<JobApplicationResponse> createApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JobApplicationRequest request) {
        JobApplicationResponse response = applicationService.createApplication(principal.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List job applications with optional search and filters")
    public ResponseEntity<List<JobApplicationResponse>> getApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) WorkType workType) {
        List<JobApplicationResponse> list = applicationService.getApplications(
                principal.getId(), search, status, priority, workType);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single job application by ID")
    public ResponseEntity<JobApplicationResponse> getApplicationById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        JobApplicationResponse response = applicationService.getApplicationById(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing job application")
    public ResponseEntity<JobApplicationResponse> updateApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request) {
        JobApplicationResponse response = applicationService.updateApplication(principal.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of an application (e.g. Applied -> Assessment -> Interview -> Offer/Rejected)")
    public ResponseEntity<JobApplicationResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        JobApplicationResponse response = applicationService.updateStatus(principal.getId(), id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a job application and its related documents/interviews")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        applicationService.deleteApplication(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
