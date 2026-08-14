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

            // No sample credentials are seeded — the vault starts empty.

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
