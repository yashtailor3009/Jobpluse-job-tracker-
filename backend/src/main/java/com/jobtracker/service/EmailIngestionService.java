package com.jobtracker.service;

import com.jobtracker.dto.EmailSyncRequest;
import com.jobtracker.dto.EmailSyncResponse;
import com.jobtracker.entity.*;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.repository.InterviewRepository;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(EmailIngestionService.class);

    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    private static final Pattern MEETING_LINK_PATTERN = Pattern.compile(
            "(https?://(?:meet\\.google\\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}|[a-zA-Z0-9.-]*zoom\\.us/j/[0-9]+(?:\\?[^\\s\"'>]+)?|teams\\.microsoft\\.com/l/meetup-join/[^\\s\"'>]+|[^\\s\"'>]*webex\\.com/[^\\s\"'>]+))",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SALARY_PATTERN = Pattern.compile(
            "(?:\\$|USD\\s*)?\\s*(\\d{2,3}(?:,\\d{3})*|\\d{2,3}k)(?:\\s*(?:-|to)\\s*(?:\\$|USD\\s*)?\\s*(\\d{2,3}(?:,\\d{3})*|\\d{2,3}k))?(?:\\s*(?:/|\\s*per\\s*)(?:yr|year|month|hr|hour))?",
            Pattern.CASE_INSENSITIVE
    );

    private static final String[] POPULAR_COMPANIES = {
            "Google", "Stripe", "Amazon", "Netflix", "Meta", "Facebook", "Apple", "Microsoft",
            "Uber", "Airbnb", "Spotify", "Coinbase", "Datadog", "Figma", "Salesforce", "Atlassian",
            "ByteDance", "Twitter", "X", "OpenAI", "Anthropic", "Adobe", "Snowflake", "Palantir"
    };

    public EmailIngestionService(JobApplicationRepository applicationRepository,
                                 InterviewRepository interviewRepository,
                                 UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EmailSyncResponse processIncomingEmail(Long userId, EmailSyncRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String text = (request.getSubject() + " " + request.getBody()).trim();
        String textLower = text.toLowerCase();

        // 1. Detect Company
        String companyName = extractCompanyName(request.getSender(), request.getSubject(), text);

        // 2. Detect Job Title
        String jobTitle = extractJobTitle(text);

        // 3. Detect Meeting Link
        String meetingLink = extractMeetingLink(request.getBody());

        // 4. Find or Create Job Application
        List<JobApplication> existingApps = applicationRepository.findByUserId(userId);
        JobApplication application = existingApps.stream()
                .filter(a -> a.getCompanyName().equalsIgnoreCase(companyName))
                .findFirst()
                .orElse(null);

        boolean isNewApp = false;
        if (application == null) {
            application = new JobApplication();
            application.setUser(user);
            application.setCompanyName(companyName);
            application.setJobTitle(jobTitle);
            application.setDateApplied(LocalDate.now());
            application.setWorkType(WorkType.REMOTE);
            application.setPriority(Priority.HIGH);
            application.setStatus(ApplicationStatus.APPLIED);
            isNewApp = true;
        }

        EmailSyncResponse response = new EmailSyncResponse();
        response.setCompanyName(companyName);
        response.setJobTitle(application.getJobTitle());

        // 5. Determine Action Type based on email content
        if (isOfferEmail(textLower)) {
            // ACTION: OFFER RECEIVED
            application.setStatus(ApplicationStatus.OFFER);
            String salary = extractSalary(text);
            if (salary != null && !salary.isEmpty()) {
                application.setSalaryRange(salary);
                response.setSalaryExtracted(salary);
            }
            application.setNotes((application.getNotes() != null ? application.getNotes() + "\n" : "") +
                    "🎉 Official Offer Letter detected via Email Sync on " + LocalDate.now());
            application = applicationRepository.save(application);

            response.setActionType("OFFER_RECEIVED");
            response.setStatus("OFFER");
            response.setApplicationId(application.getId());
            response.setMessage("🎉 Job Offer detected from " + companyName + "! Application status updated to OFFER.");
            logger.info("Email Ingestion: Job Offer updated for user {} at {}", user.getEmail(), companyName);

        } else if (meetingLink != null || isInterviewEmail(textLower)) {
            // ACTION: INTERVIEW SCHEDULED
            application.setStatus(ApplicationStatus.INTERVIEW);
            application = applicationRepository.save(application);

            LocalDateTime scheduledTime = extractScheduledTime(text);
            RoundType roundType = determineRoundType(textLower);

            Interview interview = new Interview();
            interview.setJobApplication(application);
            interview.setUser(user);
            interview.setRoundType(roundType);
            interview.setScheduledAt(scheduledTime);
            interview.setMeetingLink(meetingLink);
            interview.setInterviewer(extractInterviewerName(request.getSender(), text));
            interview.setNotes("Auto-scheduled from recruiter email: \"" + request.getSubject() + "\"");
            interview.setOutcome(InterviewOutcome.PENDING);
            interview = interviewRepository.save(interview);

            response.setActionType("INTERVIEW_SCHEDULED");
            response.setStatus("INTERVIEW");
            response.setMeetingLink(meetingLink);
            response.setScheduledAt(scheduledTime.toString());
            response.setApplicationId(application.getId());
            response.setInterviewId(interview.getId());
            response.setMessage("📅 Interview invite detected from " + companyName + " with meeting link! Added to schedule.");
            logger.info("Email Ingestion: Interview scheduled for user {} at {} with link {}", user.getEmail(), companyName, meetingLink);

        } else if (isAssessmentEmail(textLower)) {
            // ACTION: ASSESSMENT DEADLINE
            application.setStatus(ApplicationStatus.ASSESSMENT);
            LocalDate deadline = LocalDate.now().plusDays(3); // default 3 days if unspecified
            application.setDeadline(deadline);
            application.setNotes((application.getNotes() != null ? application.getNotes() + "\n" : "") +
                    "⏳ Online Assessment / Coding Challenge detected. Due: " + deadline);
            application = applicationRepository.save(application);

            response.setActionType("DEADLINE_DETECTED");
            response.setStatus("ASSESSMENT");
            response.setDeadline(deadline.toString());
            response.setApplicationId(application.getId());
            response.setMessage("⏳ Assessment / Coding challenge detected for " + companyName + "! Deadline reminder set.");
            logger.info("Email Ingestion: Assessment deadline set for user {} at {}", user.getEmail(), companyName);

        } else {
            // ACTION: APPLICATION CONFIRMED
            application = applicationRepository.save(application);

            response.setActionType("APPLICATION_CONFIRMED");
            response.setStatus(application.getStatus().name());
            response.setApplicationId(application.getId());
            response.setMessage("📬 Application confirmation detected for " + companyName + " (" + application.getJobTitle() + "). Saved to Pipeline.");
            logger.info("Email Ingestion: Application confirmation logged for user {} at {}", user.getEmail(), companyName);
        }

        return response;
    }

    private String extractCompanyName(String sender, String subject, String text) {
        // 1. Check sender domain first (e.g. recruiting@stripe.com -> Stripe)
        if (sender != null && sender.contains("@")) {
            String domain = sender.substring(sender.indexOf("@") + 1).toLowerCase();
            String domainPrefix = domain.split("\\.")[0];
            if (!domainPrefix.equals("gmail") && !domainPrefix.equals("yahoo") &&
                    !domainPrefix.equals("outlook") && !domainPrefix.equals("hotmail") &&
                    !domainPrefix.equals("greenhouse") && !domainPrefix.equals("lever") &&
                    !domainPrefix.equals("workday") && !domainPrefix.equals("mail")) {
                for (String comp : POPULAR_COMPANIES) {
                    if (comp.equalsIgnoreCase(domainPrefix)) {
                        return comp;
                    }
                }
                return capitalize(domainPrefix);
            }
        }

        // 2. Check regex patterns in subject line (e.g. "at Stripe", "from Netflix", "Stripe x Yash")
        Matcher m = Pattern.compile("(?:at|with|from|joining|team\\s+at)\\s+([A-Z][A-Za-z0-9&.\\s]{1,20})", Pattern.CASE_INSENSITIVE).matcher(subject);
        if (m.find()) {
            String candidate = m.group(1).trim().replaceAll("[.,;]+$", "");
            if (!candidate.equalsIgnoreCase("Google Meet") && !candidate.equalsIgnoreCase("Zoom") && !candidate.equalsIgnoreCase("MS Teams")) {
                return candidate;
            }
        }

        // 3. Remove URLs (like meet.google.com or zoom.us) before checking popular companies in body
        String textWithoutUrls = text.replaceAll("https?://[^\\s]+", " ");
        for (String comp : POPULAR_COMPANIES) {
            if (Pattern.compile("\\b" + Pattern.quote(comp) + "\\b", Pattern.CASE_INSENSITIVE).matcher(textWithoutUrls).find()) {
                return comp;
            }
        }

        return "Target Company";
    }

    private String extractJobTitle(String text) {
        String[] titles = {
                "Senior Software Engineer", "Software Engineer", "Frontend Engineer", "Backend Engineer",
                "Full Stack Engineer", "Staff Engineer", "Engineering Manager", "Product Manager",
                "DevOps Engineer", "Data Scientist", "Mobile Engineer", "iOS Developer", "Android Developer"
        };
        for (String title : titles) {
            if (Pattern.compile("\\b" + Pattern.quote(title) + "\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()) {
                return title;
            }
        }
        return "Software Engineer";
    }

    public String extractMeetingLink(String body) {
        if (body == null) return null;
        Matcher m = MEETING_LINK_PATTERN.matcher(body);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }

    private String extractSalary(String text) {
        Matcher m = SALARY_PATTERN.matcher(text);
        if (m.find()) {
            return m.group(0).trim();
        }
        return null;
    }

    private LocalDateTime extractScheduledTime(String text) {
        // Look for day of week or specific time (e.g. 2:00 PM, 10:00 AM)
        LocalDateTime defaultTime = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0);
        return defaultTime;
    }

    private RoundType determineRoundType(String textLower) {
        if (textLower.contains("system design") || textLower.contains("architecture")) return RoundType.SYSTEM_DESIGN;
        if (textLower.contains("technical") || textLower.contains("coding") || textLower.contains("algorithms")) return RoundType.TECHNICAL;
        if (textLower.contains("behavioral") || textLower.contains("culture") || textLower.contains("values")) return RoundType.BEHAVIORAL;
        if (textLower.contains("final") || textLower.contains("executive") || textLower.contains("onsite")) return RoundType.FINAL;
        return RoundType.HR_SCREENING;
    }

    private String extractInterviewerName(String sender, String text) {
        if (sender != null && sender.contains("<")) {
            return sender.substring(0, sender.indexOf("<")).trim();
        }
        return "Hiring Team";
    }

    private boolean isOfferEmail(String textLower) {
        return textLower.contains("offer of employment") ||
                textLower.contains("job offer") ||
                textLower.contains("pleased to offer") ||
                textLower.contains("congratulations on your offer") ||
                textLower.contains("formal offer") ||
                textLower.contains("offer letter") ||
                textLower.contains("official offer") ||
                textLower.contains("extend you an offer") ||
                textLower.contains("extend an offer") ||
                (textLower.contains("offer") && (textLower.contains("congratulations") || textLower.contains("salary") || textLower.contains("compensation") || textLower.contains("benefits")));
    }

    private boolean isInterviewEmail(String textLower) {
        return textLower.contains("interview") ||
                textLower.contains("video call") ||
                textLower.contains("discussion scheduled") ||
                textLower.contains("technical screen") ||
                textLower.contains("calendar invitation") ||
                textLower.contains("google meet") ||
                textLower.contains("zoom meeting");
    }

    private boolean isAssessmentEmail(String textLower) {
        return textLower.contains("assessment") ||
                textLower.contains("coding challenge") ||
                textLower.contains("hackerrank") ||
                textLower.contains("codesignal") ||
                textLower.contains("take-home") ||
                textLower.contains("online test") ||
                textLower.contains("complete by");
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
