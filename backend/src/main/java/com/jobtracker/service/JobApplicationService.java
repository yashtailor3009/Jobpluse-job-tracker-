package com.jobtracker.service;

import com.jobtracker.dto.*;
import com.jobtracker.entity.*;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public JobApplicationResponse createApplication(Long userId, JobApplicationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        JobApplication app = new JobApplication();
        app.setUser(user);
        app.setCompanyName(req.getCompanyName().trim());
        app.setJobTitle(req.getJobTitle().trim());
        app.setJobUrl(req.getJobUrl());
        app.setLocation(req.getLocation());
        app.setWorkType(req.getWorkType() != null ? req.getWorkType() : WorkType.REMOTE);
        app.setSalaryRange(req.getSalaryRange());
        app.setDateApplied(req.getDateApplied() != null ? req.getDateApplied() : LocalDate.now());
        app.setDeadline(req.getDeadline());
        app.setStatus(req.getStatus() != null ? req.getStatus() : ApplicationStatus.APPLIED);
        app.setPriority(req.getPriority() != null ? req.getPriority() : Priority.MEDIUM);
        app.setNotes(req.getNotes());
        app.setContactName(req.getContactName());
        app.setContactEmail(req.getContactEmail());

        JobApplication saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    @Transactional
    public JobApplicationResponse updateApplication(Long userId, Long appId, JobApplicationRequest req) {
        JobApplication app = applicationRepository.findByIdAndUserId(appId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + appId));

        app.setCompanyName(req.getCompanyName().trim());
        app.setJobTitle(req.getJobTitle().trim());
        app.setJobUrl(req.getJobUrl());
        app.setLocation(req.getLocation());
        if (req.getWorkType() != null) app.setWorkType(req.getWorkType());
        app.setSalaryRange(req.getSalaryRange());
        if (req.getDateApplied() != null) app.setDateApplied(req.getDateApplied());
        app.setDeadline(req.getDeadline());
        if (req.getStatus() != null) app.setStatus(req.getStatus());
        if (req.getPriority() != null) app.setPriority(req.getPriority());
        app.setNotes(req.getNotes());
        app.setContactName(req.getContactName());
        app.setContactEmail(req.getContactEmail());

        JobApplication updated = applicationRepository.save(app);
        return mapToResponse(updated);
    }

    @Transactional
    public JobApplicationResponse updateStatus(Long userId, Long appId, ApplicationStatus newStatus) {
        JobApplication app = applicationRepository.findByIdAndUserId(appId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + appId));

        app.setStatus(newStatus);
        JobApplication updated = applicationRepository.save(app);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(Long userId, Long appId) {
        JobApplication app = applicationRepository.findByIdAndUserId(appId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + appId));
        return mapToResponse(app);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplications(Long userId, String search,
                                                        ApplicationStatus status,
                                                        Priority priority,
                                                        WorkType workType) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<JobApplication> apps = applicationRepository.filterApplications(userId, cleanSearch, status, priority, workType);
        return apps.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteApplication(Long userId, Long appId) {
        JobApplication app = applicationRepository.findByIdAndUserId(appId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + appId));
        applicationRepository.delete(app);
    }

    public JobApplicationResponse mapToResponse(JobApplication app) {
        JobApplicationResponse res = new JobApplicationResponse();
        res.setId(app.getId());
        res.setCompanyName(app.getCompanyName());
        res.setJobTitle(app.getJobTitle());
        res.setJobUrl(app.getJobUrl());
        res.setLocation(app.getLocation());
        res.setWorkType(app.getWorkType());
        res.setSalaryRange(app.getSalaryRange());
        res.setDateApplied(app.getDateApplied());
        res.setDeadline(app.getDeadline());
        res.setStatus(app.getStatus());
        res.setPriority(app.getPriority());
        res.setNotes(app.getNotes());
        res.setContactName(app.getContactName());
        res.setContactEmail(app.getContactEmail());
        res.setCreatedAt(app.getCreatedAt());
        res.setUpdatedAt(app.getUpdatedAt());

        if (app.getInterviews() != null) {
            res.setInterviews(app.getInterviews().stream().map(interview -> new InterviewResponse(
                    interview.getId(),
                    app.getId(),
                    app.getCompanyName(),
                    app.getJobTitle(),
                    interview.getRoundType(),
                    interview.getScheduledAt(),
                    interview.getMeetingLink(),
                    interview.getInterviewer(),
                    interview.getNotes(),
                    interview.getOutcome(),
                    interview.getCreatedAt()
            )).collect(Collectors.toList()));
        }

        if (app.getDocuments() != null) {
            res.setDocuments(app.getDocuments().stream().map(doc -> new DocumentResponse(
                    doc.getId(),
                    app.getId(),
                    doc.getDocType(),
                    doc.getFileName(),
                    doc.getOriginalFileName(),
                    doc.getFileSize(),
                    doc.getContentType(),
                    doc.getUploadedAt()
            )).collect(Collectors.toList()));
        }

        return res;
    }
}
