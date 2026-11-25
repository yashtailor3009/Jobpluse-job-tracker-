package com.jobtracker.controller;

import com.jobtracker.dto.DocumentResponse;
import com.jobtracker.entity.DocumentAttachment;
import com.jobtracker.entity.DocumentType;
import com.jobtracker.security.UserPrincipal;
import com.jobtracker.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Tag(name = "Documents", description = "Resume and cover letter upload, download and management")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/api/applications/{applicationId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a resume or cover letter for a job application")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId,
            @RequestParam(defaultValue = "RESUME") DocumentType docType,
            @RequestParam("file") MultipartFile file) {
        DocumentResponse response = documentService.uploadDocument(principal.getId(), applicationId, docType, file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/applications/{applicationId}/documents")
    @Operation(summary = "Get all documents attached to a job application")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId) {
        List<DocumentResponse> list = documentService.getDocumentsByApplication(principal.getId(), applicationId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/documents/{documentId}/download")
    @Operation(summary = "Download a document file")
    public ResponseEntity<Resource> downloadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long documentId) {
        DocumentAttachment doc = documentService.getDocumentEntity(principal.getId(), documentId);
        Resource resource = documentService.loadDocumentAsResource(doc);

        String contentType = doc.getContentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/documents/{documentId}")
    @Operation(summary = "Delete an uploaded document")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long documentId) {
        documentService.deleteDocument(principal.getId(), documentId);
        return ResponseEntity.noContent().build();
    }
}
