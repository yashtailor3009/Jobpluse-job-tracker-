package com.jobtracker.config;

import com.jobtracker.entity.*;
import com.jobtracker.repository.DocumentAttachmentRepository;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final DocumentAttachmentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           JobApplicationRepository applicationRepository,
                           InterviewRepository interviewRepository,
                           DocumentAttachmentRepository documentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.documentRepository = documentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Initializing demo data for Job Tracker...");

            // Create Demo User
            User demoUser = new User();
            demoUser.setEmail("demo@jobtracker.com");
            demoUser.setFullName("Alex Morgan");
            demoUser.setPasswordHash(passwordEncoder.encode("password123"));
            demoUser.setRole(Role.ROLE_USER);
            demoUser.setEmailVerified(true);
            User savedUser = userRepository.save(demoUser);

            LocalDate today = LocalDate.now();

            // 1. Google - In Interview
            JobApplication googleApp = new JobApplication();
            googleApp.setUser(savedUser);
            googleApp.setCompanyName("Google");
            googleApp.setJobTitle("Senior Full Stack Engineer");
            googleApp.setJobUrl("https://careers.google.com/jobs/12345");
            googleApp.setLocation("Mountain View, CA (Hybrid)");
            googleApp.setWorkType(WorkType.HYBRID);
            googleApp.setSalaryRange("$180,000 - $220,000");
            googleApp.setDateApplied(today.minusDays(20));
            googleApp.setDeadline(today.plusDays(4));
            googleApp.setStatus(ApplicationStatus.INTERVIEW);
            googleApp.setPriority(Priority.HIGH);
            googleApp.setNotes("Passed recruiter screen and technical round 1. System design scheduled next.");
            googleApp.setContactName("Sarah Jenkins");
            googleApp.setContactEmail("sjenkins@google.com");
            googleApp = applicationRepository.save(googleApp);

            // Google interview round
            Interview googleInterview = new Interview();
            googleInterview.setUser(savedUser);
            googleInterview.setJobApplication(googleApp);
            googleInterview.setRoundType(RoundType.SYSTEM_DESIGN);
            googleInterview.setScheduledAt(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
            googleInterview.setMeetingLink("https://meet.google.com/xyz-abcd-efg");
            googleInterview.setInterviewer("David Chen (Principal Engineer)");
            googleInterview.setNotes("Focus on distributed cache consistency and rate limiter architecture.");
            googleInterview.setOutcome(InterviewOutcome.PENDING);
            interviewRepository.save(googleInterview);

            // 2. Stripe - Offer
            JobApplication stripeApp = new JobApplication();
            stripeApp.setUser(savedUser);
            stripeApp.setCompanyName("Stripe");
            stripeApp.setJobTitle("Backend Platform Engineer");
            stripeApp.setJobUrl("https://stripe.com/jobs/67890");
            stripeApp.setLocation("San Francisco, CA (Remote)");
            stripeApp.setWorkType(WorkType.REMOTE);
            stripeApp.setSalaryRange("$195,000 - $235,000 + Equity");
            stripeApp.setDateApplied(today.minusDays(45));
            stripeApp.setDeadline(today.minusDays(10));
            stripeApp.setStatus(ApplicationStatus.OFFER);
            stripeApp.setPriority(Priority.HIGH);
            stripeApp.setNotes("Official offer received! Reviewing equity package and benefits.");
            stripeApp.setContactName("Marcus Vance");
            stripeApp.setContactEmail("mvance@stripe.com");
            applicationRepository.save(stripeApp);

            // 3. Amazon AWS - Assessment
            JobApplication amazonApp = new JobApplication();
            amazonApp.setUser(savedUser);
            amazonApp.setCompanyName("Amazon");
            amazonApp.setJobTitle("Software Development Engineer II");
            amazonApp.setJobUrl("https://amazon.jobs/en/jobs/112233");
            amazonApp.setLocation("Seattle, WA (Onsite)");
            amazonApp.setWorkType(WorkType.ONSITE);
            amazonApp.setSalaryRange("$165,000 - $190,000");
            amazonApp.setDateApplied(today.minusDays(8));
            amazonApp.setDeadline(today.plusDays(2)); // URGENT deadline
            amazonApp.setStatus(ApplicationStatus.ASSESSMENT);
            amazonApp.setPriority(Priority.MEDIUM);
            amazonApp.setNotes("Received 90-minute HackerRank online assessment link. Deadline in 2 days.");
            amazonApp.setContactName("Amazon University/Industry Talent");
            amazonApp.setContactEmail("recruiting@amazon.com");
            applicationRepository.save(amazonApp);

            // 4. Netflix - Rejected
            JobApplication netflixApp = new JobApplication();
            netflixApp.setUser(savedUser);
            netflixApp.setCompanyName("Netflix");
            netflixApp.setJobTitle("Distributed Systems Engineer");
            netflixApp.setJobUrl("https://jobs.netflix.com/jobs/99887");
            netflixApp.setLocation("Los Gatos, CA");
            netflixApp.setWorkType(WorkType.HYBRID);
            netflixApp.setSalaryRange("$240,000 (All Cash)");
            netflixApp.setDateApplied(today.minusDays(60));
            netflixApp.setDeadline(today.minusDays(30));
            netflixApp.setStatus(ApplicationStatus.REJECTED);
            netflixApp.setPriority(Priority.MEDIUM);
            netflixApp.setNotes("Reached final round panel. Position filled internally.");
            netflixApp.setContactName("Rachel Adams");
            netflixApp.setContactEmail("radams@netflix.com");
            applicationRepository.save(netflixApp);

            // 5. Datadog - Applied
            JobApplication datadogApp = new JobApplication();
            datadogApp.setUser(savedUser);
            datadogApp.setCompanyName("Datadog");
            datadogApp.setJobTitle("Software Engineer - Core Observability");
            datadogApp.setJobUrl("https://careers.datadoghq.com/detail/445566");
            datadogApp.setLocation("New York, NY (Remote)");
            datadogApp.setWorkType(WorkType.REMOTE);
            datadogApp.setSalaryRange("$170,000 - $200,000");
            datadogApp.setDateApplied(today.minusDays(3));
            datadogApp.setDeadline(today.plusDays(10));
            datadogApp.setStatus(ApplicationStatus.APPLIED);
            datadogApp.setPriority(Priority.HIGH);
            datadogApp.setNotes("Applied with referral from engineering alumni.");
            datadogApp.setContactName("Alex Rivera");
            datadogApp.setContactEmail("arivera@datadoghq.com");
            applicationRepository.save(datadogApp);

            // 6. Figma - Applied
            JobApplication figmaApp = new JobApplication();
            figmaApp.setUser(savedUser);
            figmaApp.setCompanyName("Figma");
            figmaApp.setJobTitle("Frontend Systems Architect");
            figmaApp.setJobUrl("https://figma.com/careers/778899");
            figmaApp.setLocation("San Francisco, CA (Hybrid)");
            figmaApp.setWorkType(WorkType.HYBRID);
            figmaApp.setSalaryRange("$185,000 - $215,000");
            figmaApp.setDateApplied(today.minusDays(1));
            figmaApp.setDeadline(today.plusDays(7));
            figmaApp.setStatus(ApplicationStatus.APPLIED);
            figmaApp.setPriority(Priority.MEDIUM);
            figmaApp.setNotes("Submitted customized cover letter focusing on canvas rendering and performance.");
            applicationRepository.save(figmaApp);

            logger.info("Demo data initialized successfully! User: demo@jobtracker.com / password123");
        }
    }
}
