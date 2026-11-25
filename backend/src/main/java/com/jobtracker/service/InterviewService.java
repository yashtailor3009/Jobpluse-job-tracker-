package com.jobtracker.service;

import com.jobtracker.dto.InterviewRequest;
import com.jobtracker.dto.InterviewResponse;
import com.jobtracker.entity.Interview;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public InterviewService(InterviewRepository interviewRepository,
                            JobApplicationRepository applicationRepository,
                            UserRepository userRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InterviewResponse createInterview(Long userId, InterviewRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        JobApplication app = applicationRepository.findByIdAndUserId(req.getJobApplicationId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + req.getJobApplicationId()));

        Interview interview = new Interview();
        interview.setUser(user);
        interview.setJobApplication(app);
        interview.setRoundType(req.getRoundType());
        interview.setScheduledAt(req.getScheduledAt());
        interview.setMeetingLink(req.getMeetingLink());
        interview.setInterviewer(req.getInterviewer());
        interview.setNotes(req.getNotes());
        if (req.getOutcome() != null) {
            interview.setOutcome(req.getOutcome());
        }

        Interview saved = interviewRepository.save(interview);
        return mapToResponse(saved);
    }

    @Transactional
    public InterviewResponse updateInterview(Long userId, Long interviewId, InterviewRequest req) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        if (req.getRoundType() != null) interview.setRoundType(req.getRoundType());
        if (req.getScheduledAt() != null) interview.setScheduledAt(req.getScheduledAt());
        interview.setMeetingLink(req.getMeetingLink());
        interview.setInterviewer(req.getInterviewer());
        interview.setNotes(req.getNotes());
        if (req.getOutcome() != null) interview.setOutcome(req.getOutcome());

        Interview updated = interviewRepository.save(interview);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviews(Long userId) {
        return interviewRepository.findByUserIdOrderByScheduledAtAsc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getUpcomingInterviews(Long userId) {
        return interviewRepository.findUpcomingInterviews(userId, LocalDateTime.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteInterview(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));
        interviewRepository.delete(interview);
    }

    private InterviewResponse mapToResponse(Interview i) {
        return new InterviewResponse(
                i.getId(),
                i.getJobApplication().getId(),
                i.getJobApplication().getCompanyName(),
                i.getJobApplication().getJobTitle(),
                i.getRoundType(),
                i.getScheduledAt(),
                i.getMeetingLink(),
                i.getInterviewer(),
                i.getNotes(),
                i.getOutcome(),
                i.getCreatedAt()
        );
    }
}
