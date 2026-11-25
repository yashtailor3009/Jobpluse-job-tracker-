package com.jobtracker;

import com.jobtracker.dto.EmailSyncRequest;
import com.jobtracker.dto.EmailSyncResponse;
import com.jobtracker.entity.*;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.service.EmailIngestionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailIngestionServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmailIngestionService emailIngestionService;

    @Test
    void testExtractMeetingLink() {
        String body = "Hi Alex, please join the video call at https://meet.google.com/abc-defg-hij for your technical interview.";
        String link = emailIngestionService.extractMeetingLink(body);
        assertEquals("https://meet.google.com/abc-defg-hij", link);
    }

    @Test
    void testProcessIncomingInterviewEmail() {
        Long userId = 1L;
        User user = new User(userId, "alex@example.com", "pass", "Alex", Role.ROLE_USER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(applicationRepository.findByUserId(userId)).thenReturn(new ArrayList<>());
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> {
            JobApplication app = inv.getArgument(0);
            app.setId(101L);
            return app;
        });
        when(interviewRepository.save(any(Interview.class))).thenAnswer(inv -> {
            Interview i = inv.getArgument(0);
            i.setId(201L);
            return i;
        });

        EmailSyncRequest request = new EmailSyncRequest(
                "recruiting@google.com",
                "Interview Invitation: Google Technical Round",
                "Hi Alex, We would like to invite you for a Technical Round. Join Google Meet: https://meet.google.com/xyz-uvwx-rst at 2:00 PM.",
                null
        );

        EmailSyncResponse response = emailIngestionService.processIncomingEmail(userId, request);

        assertNotNull(response);
        assertEquals("INTERVIEW_SCHEDULED", response.getActionType());
        assertEquals("Google", response.getCompanyName());
        assertEquals("INTERVIEW", response.getStatus());
        assertEquals("https://meet.google.com/xyz-uvwx-rst", response.getMeetingLink());
        assertEquals(101L, response.getApplicationId());
        assertEquals(201L, response.getInterviewId());

        verify(applicationRepository, atLeastOnce()).save(any(JobApplication.class));
        verify(interviewRepository, times(1)).save(any(Interview.class));
    }

    @Test
    void testProcessIncomingOfferEmail() {
        Long userId = 1L;
        User user = new User(userId, "alex@example.com", "pass", "Alex", Role.ROLE_USER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(applicationRepository.findByUserId(userId)).thenReturn(new ArrayList<>());
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> {
            JobApplication app = inv.getArgument(0);
            app.setId(102L);
            return app;
        });

        EmailSyncRequest request = new EmailSyncRequest(
                "careers@stripe.com",
                "Formal Offer of Employment: Stripe",
                "Congratulations! We are pleased to offer you the position of Senior Full Stack Engineer at Stripe with compensation of $180,000 / year.",
                null
        );

        EmailSyncResponse response = emailIngestionService.processIncomingEmail(userId, request);

        assertNotNull(response);
        assertEquals("OFFER_RECEIVED", response.getActionType());
        assertEquals("Stripe", response.getCompanyName());
        assertEquals("OFFER", response.getStatus());
        assertNotNull(response.getSalaryExtracted());
        assertTrue(response.getSalaryExtracted().contains("180,000"));
    }

    @Test
    void testProcessIncomingAssessmentEmail() {
        Long userId = 1L;
        User user = new User(userId, "alex@example.com", "pass", "Alex", Role.ROLE_USER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(applicationRepository.findByUserId(userId)).thenReturn(new ArrayList<>());
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> {
            JobApplication app = inv.getArgument(0);
            app.setId(103L);
            return app;
        });

        EmailSyncRequest request = new EmailSyncRequest(
                "assessment@amazon.com",
                "Amazon Online Assessment Invitation",
                "Please complete the online coding challenge on HackerRank within 48 hours to be considered for next rounds.",
                null
        );

        EmailSyncResponse response = emailIngestionService.processIncomingEmail(userId, request);

        assertNotNull(response);
        assertEquals("DEADLINE_DETECTED", response.getActionType());
        assertEquals("Amazon", response.getCompanyName());
        assertEquals("ASSESSMENT", response.getStatus());
        assertNotNull(response.getDeadline());
    }
}
