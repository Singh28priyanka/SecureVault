package com.securevault.service;

import com.securevault.dto.AuthDtos.*;
import com.securevault.dto.UserDtos.UserProfile;
import com.securevault.entity.Role;
import com.securevault.entity.User;
import com.securevault.exception.ApiException;
import com.securevault.repository.UserRepository;
import com.securevault.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/** Orchestrates registration, login (incl. MFA challenge), token refresh and MFA management. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MonitoringService monitoring;
    private final AuditService audit;
    private final NotificationService notifications;
    private final MfaService mfaService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username()))
            throw ApiException.badRequest("Username already taken");
        if (userRepository.existsByEmail(req.email()))
            throw ApiException.badRequest("Email already registered");

        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .fullName(req.fullName())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.USER)
                .build();
        user = userRepository.save(user);

        audit.log(user.getId(), user.getUsername(), "USER_REGISTER", "AUTH", "Account created");
        notifications.push(user.getId(), "SYSTEM", "Welcome to SecureVault",
                "Your encrypted vault is ready. Enable MFA for extra protection.");

        return issueTokens(user, false);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletRequest http) {
        String ip = clientIp(http);
        String ua = http.getHeader("User-Agent");

        User user = userRepository
                .findByUsernameOrEmail(req.usernameOrEmail(), req.usernameOrEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            if (user != null) {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                userRepository.save(user);
                monitoring.recordLogin(user, false, ip, ua);
                audit.log(user.getId(), user.getUsername(), "LOGIN_FAILURE", "AUTH", "Bad password");
            }
            throw ApiException.unauthorized("Invalid credentials");
        }

        if (!user.isEnabled() || user.isAccountLocked())
            throw ApiException.forbidden("Account is disabled or locked");

        // ---- MFA challenge ----
        if (user.isMfaEnabled()) {
            if (req.mfaCode() == null || req.mfaCode().isBlank()) {
                // First leg: password correct, code required.
                return new AuthResponse(null, null, 0, true, null);
            }
            if (!mfaService.verify(user.getMfaSecret(), req.mfaCode())) {
                monitoring.recordLogin(user, false, ip, ua);
                audit.log(user.getId(), user.getUsername(), "MFA_FAILURE", "AUTH", "Invalid MFA code");
                throw ApiException.unauthorized("Invalid MFA code");
            }
        }

        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        monitoring.recordLogin(user, true, ip, ua);
        audit.log(user.getId(), user.getUsername(), "LOGIN_SUCCESS", "AUTH", "Signed in from " + ip);
        notifications.push(user.getId(), "LOGIN", "New sign-in",
                "Your account was accessed from " + ip + ".");

        return issueTokens(user, false);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest req) {
        String username;
        try {
            username = jwtService.extractUsername(req.refreshToken());
        } catch (Exception e) {
            throw ApiException.unauthorized("Invalid refresh token");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        if (!jwtService.isValid(req.refreshToken(), username))
            throw ApiException.unauthorized("Refresh token expired");
        return issueTokens(user, false);
    }

    // ---- MFA management ----

    @Transactional
    public MfaSetupResponse beginMfaSetup(Long userId) {
        User user = getUser(userId);
        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);           // stored but not yet enabled
        userRepository.save(user);
        String uri = mfaService.otpAuthUri(user.getEmail(), secret);
        String qr = mfaService.qrCodeDataUri(user.getEmail(), secret);
        return new MfaSetupResponse(secret, uri, qr);
    }

    @Transactional
    public void enableMfa(Long userId, String code) {
        User user = getUser(userId);
        if (user.getMfaSecret() == null)
            throw ApiException.badRequest("Start MFA setup first");
        if (!mfaService.verify(user.getMfaSecret(), code))
            throw ApiException.badRequest("Incorrect verification code");
        user.setMfaEnabled(true);
        userRepository.save(user);
        audit.log(userId, user.getUsername(), "MFA_ENABLED", "AUTH", "MFA turned on");
        notifications.push(userId, "SECURITY", "MFA enabled",
                "Two-factor authentication is now protecting your account.");
    }

    @Transactional
    public void disableMfa(Long userId) {
        User user = getUser(userId);
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
        audit.log(userId, user.getUsername(), "MFA_DISABLED", "AUTH", "MFA turned off");
    }

    public UserProfile profile(Long userId) {
        return UserProfile.from(getUser(userId));
    }

    // ---- helpers ----

    private AuthResponse issueTokens(User user, boolean mfaRequired) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                jwtService.getAccessExpMs(),
                mfaRequired,
                UserProfile.from(user));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String clientIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        return xf != null ? xf.split(",")[0].trim() : req.getRemoteAddr();
    }
}
