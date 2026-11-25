package com.jobtracker;

import com.jobtracker.dto.AnalyticsSummaryResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void testGetSummaryCalculations() {
        Long userId = 1L;

        when(applicationRepository.countByUserId(userId)).thenReturn(10L);
        when(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED)).thenReturn(4L);
        when(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.ASSESSMENT)).thenReturn(2L);
        when(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW)).thenReturn(2L);
        when(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER)).thenReturn(1L);
        when(applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED)).thenReturn(1L);
        when(applicationRepository.findUpcomingDeadlines(eq(userId), any())).thenReturn(Collections.emptyList());

        AnalyticsSummaryResponse summary = analyticsService.getSummary(userId);

        assertNotNull(summary);
        assertEquals(10L, summary.getTotalApplications());
        assertEquals(2L, summary.getActiveInterviews());
        assertEquals(1L, summary.getOffersCount());
        assertEquals(1L, summary.getRejectedCount());
        // (interview 2 + offer 1) / 10 * 100 = 30.0%
        assertEquals(30.0, summary.getInterviewRate());
        // offer 1 / 10 * 100 = 10.0%
        assertEquals(10.0, summary.getOfferRate());
        // rejected 1 / 10 * 100 = 10.0%
        assertEquals(10.0, summary.getRejectionRate());
    }
}
