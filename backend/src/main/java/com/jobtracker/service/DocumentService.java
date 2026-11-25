package com.jobtracker.service;

import com.jobtracker.dto.DocumentResponse;
import com.jobtracker.entity.DocumentAttachment;
import com.jobtracker.entity.DocumentType;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.DocumentAttachmentRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentAttachmentRepository documentRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(DocumentAttachmentRepository documentRepository,
                           JobApplicationRepository applicationRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public DocumentResponse uploadDocument(Long userId, Long applicationId, DocumentType docType, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        JobApplication app = applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        String storedFileName = fileStorageService.storeFile(file);

        DocumentAttachment attachment = new DocumentAttachment();
        attachment.setUser(user);
        attachment.setJobApplication(app);
        attachment.setDocType(docType != null ? docType : DocumentType.RESUME);
        attachment.setFileName(storedFileName);
        attachment.setOriginalFileName(file.getOriginalFilename());
        attachment.setFileSize(file.getSize());
        attachment.setContentType(file.getContentType());
        attachment.setStoragePath(storedFileName);

        DocumentAttachment saved = documentRepository.save(attachment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DocumentAttachment getDocumentEntity(Long userId, Long documentId) {
        return documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
    }

    public Resource loadDocumentAsResource(DocumentAttachment doc) {
        return fileStorageService.loadFileAsResource(doc.getFileName());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByApplication(Long userId, Long applicationId) {
        return documentRepository.findByJobApplicationIdAndUserId(applicationId, userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long userId, Long documentId) {
        DocumentAttachment doc = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        fileStorageService.deleteFile(doc.getFileName());
        documentRepository.delete(doc);
    }

    private DocumentResponse mapToResponse(DocumentAttachment d) {
        return new DocumentResponse(
                d.getId(),
                d.getJobApplication().getId(),
                d.getDocType(),
                d.getFileName(),
                d.getOriginalFileName(),
                d.getFileSize(),
                d.getContentType(),
                d.getUploadedAt()
        );
    }
}
