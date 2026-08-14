package com.securevault.service;

import com.securevault.entity.AlertSeverity;
import com.securevault.entity.Credential;
import com.securevault.repository.CredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduled Password Expiration monitoring: raises alerts/notifications for
 * credentials whose rotation date has passed. Runs hourly.
 */
@Component
@RequiredArgsConstructor
public class ExpiryMonitorJob {

    private final CredentialRepository credentialRepository;
    private final MonitoringService monitoring;

    @Scheduled(fixedRate = 3_600_000L, initialDelay = 60_000L) // hourly, 1-min warmup
    public void checkExpiries() {
        Instant now = Instant.now();
        Instant soon = now.plus(7, ChronoUnit.DAYS);

        List<Credential> all = credentialRepository.findAll();
        for (Credential c : all) {
            Instant exp = c.getPasswordExpiresAt();
            if (exp == null) continue;
            if (exp.isBefore(now)) {
                monitoring.raiseAlert(c.getOwnerId(), AlertSeverity.MEDIUM, "PASSWORD_EXPIRED",
                        "Password expired",
                        "The password for \"" + c.getTitle() + "\" has expired. Rotate it soon.");
            } else if (exp.isBefore(soon)) {
                monitoring.raiseAlert(c.getOwnerId(), AlertSeverity.LOW, "PASSWORD_EXPIRING",
                        "Password expiring soon",
                        "The password for \"" + c.getTitle() + "\" expires within 7 days.");
            }
        }
    }
}
