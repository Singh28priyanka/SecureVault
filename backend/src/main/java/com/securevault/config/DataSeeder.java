package com.securevault.config;

import com.securevault.dto.CommonDtos.CategoryRequest;
import com.securevault.dto.CredentialDtos.CredentialRequest;
import com.securevault.entity.CredentialType;
import com.securevault.entity.Role;
import com.securevault.entity.User;
import com.securevault.repository.UserRepository;
import com.securevault.service.CategoryService;
import com.securevault.service.CredentialService;
import com.securevault.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Seeds demo accounts and sample data so the app is explorable immediately.
 * Disabled by setting {@code securevault.seed.enabled=false}.
 *
 * <pre>
 *   admin@securevault.io / Admin@12345   (ADMIN)
 *   demo@securevault.io  / Demo@12345    (USER)   ← main demo account
 *   team@securevault.io  / Team@12345    (TEAM_MEMBER)
 * </pre>
 */
@Configuration
@ConditionalOnProperty(name = "securevault.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CredentialService credentialService;
    private final CategoryService categoryService;
    private final MonitoringService monitoring;

    @Bean
    ApplicationRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Seed skipped — users already present.");
                return;
            }

            createUser("admin", "admin@securevault.io", "Admin@12345", "Site Administrator", Role.ADMIN);
            User demo = createUser("demo", "demo@securevault.io", "Demo@12345", "Demo User", Role.USER);
            createUser("team", "team@securevault.io", "Team@12345", "Team Member", Role.TEAM_MEMBER);

            // Categories for the demo user
            categoryService.create(demo.getId(), new CategoryRequest("Personal", "#22d3ee", "user"));
            categoryService.create(demo.getId(), new CategoryRequest("Work", "#a78bfa", "briefcase"));
            categoryService.create(demo.getId(), new CategoryRequest("Finance", "#fbbf24", "bank"));

            // Sample credentials (mixed strengths to make analytics interesting)
            seedCredential(demo, "GitHub", CredentialType.WEBSITE_LOGIN, "demo-dev",
                    "Gh!7xQ2#pLmZ9v", "https://github.com", null);
            seedCredential(demo, "Gmail", CredentialType.EMAIL_ACCOUNT, "demo@gmail.com",
                    "S3cur3-Mail!2025", "https://mail.google.com", null);
            seedCredential(demo, "Netflix", CredentialType.SOCIAL_MEDIA, "demo@securevault.io",
                    "password1", "https://netflix.com", null);          // intentionally weak
            seedCredential(demo, "Chase Bank", CredentialType.BANKING, "demo1990",
                    "Q8v#Lp2!nR4wZx7t", "https://chase.com",
                    Instant.now().minus(3, ChronoUnit.DAYS));            // expired
            seedCredential(demo, "AWS Access Key", CredentialType.API_KEY, "AKIADEMOKEY",
                    "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", null, null);
            seedCredential(demo, "Recovery Codes", CredentialType.SECURE_NOTE, null,
                    "backup-1: 8842-1190\nbackup-2: 5521-0098", null, null);

            // A couple of illustrative security signals
            monitoring.recordLogin(demo, true, "127.0.0.1", "Mozilla/5.0 (Macintosh) Chrome/124");

            log.info("========================================================");
            log.info(" SecureVault demo data ready.");
            log.info("   admin@securevault.io / Admin@12345");
            log.info("   demo@securevault.io  / Demo@12345   (start here)");
            log.info("   team@securevault.io  / Team@12345");
            log.info("========================================================");
        };
    }

    private User createUser(String username, String email, String rawPassword, String fullName, Role role) {
        User u = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        return userRepository.save(u);
    }

    private void seedCredential(User owner, String title, CredentialType type, String username,
                                String secret, String url, Instant expiresAt) {
        credentialService.create(owner.getId(), owner.getUsername(),
                new CredentialRequest(title, type, username, secret, url,
                        url == null ? null : url.replaceFirst("https?://", ""),
                        null, null, false, expiresAt));
    }
}
