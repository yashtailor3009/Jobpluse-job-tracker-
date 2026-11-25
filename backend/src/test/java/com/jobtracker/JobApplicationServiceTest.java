package com.jobtracker;

import com.jobtracker.dto.JobApplicationRequest;
import com.jobtracker.dto.JobApplicationResponse;
import com.jobtracker.entity.*;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.service.JobApplicationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobApplicationService applicationService;

    @Test
    void testCreateApplication() {
        Long userId = 1L;
        User user = new User(userId, "test@example.com", "pass", "Test User", Role.ROLE_USER);

        JobApplicationRequest request = new JobApplicationRequest();
        request.setCompanyName("Google");
        request.setJobTitle("Software Engineer");
        request.setStatus(ApplicationStatus.APPLIED);
        request.setPriority(Priority.HIGH);
        request.setDateApplied(LocalDate.now());

        JobApplication saved = new JobApplication();
        saved.setId(100L);
        saved.setUser(user);
        saved.setCompanyName("Google");
        saved.setJobTitle("Software Engineer");
        saved.setStatus(ApplicationStatus.APPLIED);
        saved.setPriority(Priority.HIGH);
        saved.setDateApplied(LocalDate.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(applicationRepository.save(any(JobApplication.class))).thenReturn(saved);

        JobApplicationResponse response = applicationService.createApplication(userId, request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Google", response.getCompanyName());
        assertEquals("Software Engineer", response.getJobTitle());
        assertEquals(ApplicationStatus.APPLIED, response.getStatus());
    }

    @Test
    void testUpdateStatus() {
        Long userId = 1L;
        Long appId = 100L;

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setCompanyName("Google");
        app.setStatus(ApplicationStatus.APPLIED);

        when(applicationRepository.findByIdAndUserId(appId, userId)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        JobApplicationResponse response = applicationService.updateStatus(userId, appId, ApplicationStatus.INTERVIEW);

        assertNotNull(response);
        assertEquals(ApplicationStatus.INTERVIEW, response.getStatus());
    }
}
