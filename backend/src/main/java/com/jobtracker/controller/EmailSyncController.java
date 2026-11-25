package com.jobtracker.controller;

import com.jobtracker.dto.EmailSyncRequest;
import com.jobtracker.dto.EmailSyncResponse;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.EmailIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-sync")
@Tag(name = "Email Sync & Meeting Ingestion", description = "Automated email parsing, meeting link extraction and pipeline sync")
public class EmailSyncController {

    private final EmailIngestionService emailIngestionService;

    public EmailSyncController(EmailIngestionService emailIngestionService) {
        this.emailIngestionService = emailIngestionService;
    }

    @PostMapping("/process")
    @Operation(summary = "Automatically ingest and parse a recruiter email, interview meeting invite, or offer letter")
    public ResponseEntity<EmailSyncResponse> processEmail(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody EmailSyncRequest request) {
        EmailSyncResponse response = emailIngestionService.processIncomingEmail(principal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
