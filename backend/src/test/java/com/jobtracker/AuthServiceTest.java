package com.jobtracker;

import com.jobtracker.dto.AuthResponse;
import com.jobtracker.dto.RegisterRequest;
import com.jobtracker.dto.RegisterResponse;
import com.jobtracker.dto.VerifyOtpRequest;
import com.jobtracker.entity.Role;
import com.jobtracker.entity.User;
import com.jobtracker.exception.BadRequestException;
import com.jobtracker.repository.UserRepository;
import com.jobtracker.security.JwtTokenProvider;
import com.jobtracker.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private com.jobtracker.service.EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegisterGeneratesOtpAndSetsUnverified() {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "password123");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegisterResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jane@example.com", response.getEmail());
        assertTrue(response.isRequiresOtp());
        assertEquals(2, response.getExpiryMinutes());

        verify(emailService).sendOtpEmail(eq("jane@example.com"), eq("Jane Doe"), anyString(), eq(2));
        verify(userRepository).save(argThat(user ->
                !user.isEmailVerified() &&
                user.getOtpCode() != null &&
                user.getOtpExpiry() != null
        ));
    }

    @Test
    void testVerifyOtpSuccess() {
        User user = new User();
        user.setId(10L);
        user.setEmail("jane@example.com");
        user.setFullName("Jane Doe");
        user.setRole(Role.ROLE_USER);
        user.setEmailVerified(false);
        user.setOtpCode("123456");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateTokenFromEmail("jane@example.com", 10L, "Jane Doe")).thenReturn("jwt-test-token");

        VerifyOtpRequest request = new VerifyOtpRequest("jane@example.com", "123456");
        AuthResponse response = authService.verifyOtp(request);

        assertNotNull(response);
        assertEquals("jwt-test-token", response.getToken());
        assertEquals("jane@example.com", response.getUser().getEmail());
        assertTrue(user.isEmailVerified());
        assertNull(user.getOtpCode());
    }

    @Test
    void testVerifyOtpInvalidCodeThrowsException() {
        User user = new User();
        user.setEmail("jane@example.com");
        user.setEmailVerified(false);
        user.setOtpCode("123456");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        VerifyOtpRequest request = new VerifyOtpRequest("jane@example.com", "999999");
        assertThrows(BadRequestException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void testVerifyOtpExpiredThrowsException() {
        User user = new User();
        user.setEmail("jane@example.com");
        user.setEmailVerified(false);
        user.setOtpCode("123456");
        user.setOtpExpiry(LocalDateTime.now().minusMinutes(1)); // Expired!

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        VerifyOtpRequest request = new VerifyOtpRequest("jane@example.com", "123456");
        assertThrows(BadRequestException.class, () -> authService.verifyOtp(request));
    }
}
