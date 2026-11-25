package com.jobtracker.service;

import com.jobtracker.dto.AuthResponse;
import com.jobtracker.dto.LoginRequest;
import com.jobtracker.dto.RegisterRequest;
import com.jobtracker.dto.RegisterResponse;
import com.jobtracker.dto.ResendOtpRequest;
import com.jobtracker.dto.UserResponse;
import com.jobtracker.dto.VerifyOtpRequest;
import com.jobtracker.entity.Role;
import com.jobtracker.entity.User;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtTokenProvider;
import com.jobtracker.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final Random random = new Random();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    private String generate6DigitOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (existing.isEmailVerified()) {
                throw new BadRequestException("Email address is already in use and verified. Please sign in.");
            }
            // User exists but has not verified email yet; re-use record and send fresh OTP
            existing.setFullName(request.getFullName().trim());
            existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            String otp = generate6DigitOtp();
            existing.setOtpCode(otp);
            existing.setOtpExpiry(LocalDateTime.now().plusMinutes(2));
            existing.setFailedOtpAttempts(0);
            userRepository.save(existing);

            emailService.sendOtpEmail(email, existing.getFullName(), otp, 2);
            return new RegisterResponse("Verification code sent to " + email + ". Please check your email inbox.", email, true, 2);
        }

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        user.setEmailVerified(false);

        String otp = generate6DigitOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(2));
        user.setFailedOtpAttempts(0);

        userRepository.save(user);

        emailService.sendOtpEmail(email, user.getFullName(), otp, 2);
        return new RegisterResponse("Account created! A 6-digit verification code has been dispatched to your email.", email, true, 2);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No registration found for email: " + email));

        if (!user.isEmailVerified()) {
            if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
                user.setOtpCode(null);
                user.setOtpExpiry(null);
                userRepository.save(user);
                throw new BadRequestException("This verification code has expired (valid for 2 minutes). Please click 'Resend Code' to receive a new one.");
            }

            if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp().trim())) {
                int attempts = user.getFailedOtpAttempts() + 1;
                user.setFailedOtpAttempts(attempts);
                if (attempts >= 5) {
                    user.setOtpCode(null);
                    user.setOtpExpiry(null);
                    userRepository.save(user);
                    throw new BadRequestException("Maximum verification attempts exceeded. For your security, this code has been invalidated. Please click 'Resend Code'.");
                }
                userRepository.save(user);
                int remaining = 5 - attempts;
                throw new BadRequestException("Invalid 6-digit code. Please check your email. (" + remaining + " attempts remaining)");
            }

            user.setEmailVerified(true);
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            user.setFailedOtpAttempts(0);
            user = userRepository.save(user);
            logger.info("✅ Email successfully verified for user: {}", email);
        }

        String token = tokenProvider.generateTokenFromEmail(
                user.getEmail(),
                user.getId(),
                user.getFullName()
        );

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new AuthResponse(token, userResponse);
    }

    @Transactional
    public RegisterResponse resendOtp(ResendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No registration found for email: " + email));

        if (user.isEmailVerified()) {
            throw new BadRequestException("This account is already verified. Please sign in.");
        }

        String otp = generate6DigitOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(2));
        user.setFailedOtpAttempts(0);
        userRepository.save(user);

        emailService.sendOtpEmail(email, user.getFullName(), otp, 2);
        return new RegisterResponse("A fresh 6-digit verification code has been sent to " + email + ".", email, true, 2);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new BadRequestException("Your email is not verified yet. Please complete OTP verification to sign in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new AuthResponse(token, userResponse);
    }

    public UserResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User record not found"));

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public EmailService.SentEmailRecord getLatestSentEmail(String email) {
        return emailService.getLatestEmail(email);
    }
}
