package com.securevault.service;

import com.securevault.dto.DashboardDtos.*;
import com.securevault.entity.*;
import com.securevault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/** Analytics Dashboard module: password health, security posture and admin metrics. */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CredentialRepository credentialRepo;
    private final SecurityAlertRepository alertRepo;
    private final LoginActivityRepository loginRepo;
    private final AuditLogRepository auditRepo;
    private final UserRepository userRepo;
    private final SharedCredentialRepository shareRepo;
    private final EncryptionService encryption;

    @Transactional(readOnly = true)
    public UserDashboard userDashboard(Long userId) {
        List<Credential> creds = credentialRepo.findByOwnerIdOrderByUpdatedAtDesc(userId);
        List<Credential> withSecret = creds.stream()
                .filter(c -> c.getType() != CredentialType.SECURE_NOTE && c.getEncryptedSecret() != null)
                .toList();

        long weak = withSecret.stream().filter(c -> c.getStrengthScore() < 40).count();
        long expired = creds.stream().filter(c -> c.getPasswordExpiresAt() != null
                && c.getPasswordExpiresAt().isBefore(Instant.now())).count();
        long favorites = creds.stream().filter(Credential::isFavorite).count();

        // Reused-password detection over decrypted secrets.
        Map<String, Long> secretCounts = new HashMap<>();
        for (Credential c : withSecret) {
            try {
                String plain = encryption.decrypt(c.getEncryptedSecret());
                if (plain != null && !plain.isBlank())
                    secretCounts.merge(plain, 1L, Long::sum);
            } catch (Exception ignored) { }
        }
        long reused = secretCounts.values().stream().filter(v -> v > 1)
                .mapToLong(Long::longValue).sum();

        int[] buckets = new int[5]; // veryWeak, weak, moderate, strong, veryStrong
        for (Credential c : withSecret) {
            int s = c.getStrengthScore();
            int idx = s >= 80 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : s >= 20 ? 1 : 0;
            buckets[idx]++;
        }

        int health = computeHealthScore(withSecret, weak, reused, expired);

        Map<String, Long> byType = creds.stream()
                .collect(Collectors.groupingBy(c -> c.getType().name(), Collectors.counting()));

        long activeShares = shareRepo.findByOwnerId(userId).stream()
                .filter(SharedCredential::isActive).count();
        long unresolvedAlerts = alertRepo.countByUserIdAndResolvedFalse(userId);

        return new UserDashboard(
                health, creds.size(), weak, reused, expired, favorites,
                activeShares, unresolvedAlerts, byType,
                Arrays.stream(buckets).boxed().toList(),
                loginTrend(userId),
                recentActivity(userId));
    }

    private int computeHealthScore(List<Credential> withSecret, long weak, long reused, long expired) {
        if (withSecret.isEmpty()) return 100;
        double avgStrength = withSecret.stream().mapToInt(Credential::getStrengthScore).average().orElse(0);
        double penalty = (weak * 6.0) + (reused * 8.0) + (expired * 4.0);
        int score = (int) Math.round(avgStrength - (penalty / withSecret.size()) * 10);
        return Math.max(0, Math.min(100, score));
    }

    private List<ActivityPoint> loginTrend(Long userId) {
        Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
        List<LoginActivity> logins = loginRepo.findByUserIdAndCreatedAtAfter(userId, since);
        ZoneId zone = ZoneId.systemDefault();
        Map<LocalDate, Long> counts = logins.stream()
                .collect(Collectors.groupingBy(l -> l.getCreatedAt().atZone(zone).toLocalDate(),
                        Collectors.counting()));
        List<ActivityPoint> points = new ArrayList<>();
        LocalDate today = LocalDate.now(zone);
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            points.add(new ActivityPoint(
                    d.getDayOfWeek().toString().substring(0, 3), counts.getOrDefault(d, 0L)));
        }
        return points;
    }

    private List<RecentActivity> recentActivity(Long userId) {
        return auditRepo.findTop100ByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(12)
                .map(a -> new RecentActivity(
                        prettyAction(a.getAction()), a.getDetail(),
                        timeAgo(a.getCreatedAt()), a.getCategory()))
                .toList();
    }

    // ---- Admin dashboard ----

    @Transactional(readOnly = true)
    public AdminDashboard adminDashboard() {
        long totalUsers = userRepo.count();
        long activeUsers = userRepo.countByEnabledTrue();
        long totalCreds = credentialRepo.count();
        List<SecurityAlert> alerts = alertRepo.findAll();
        long critical = alerts.stream()
                .filter(a -> a.getSeverity() == AlertSeverity.CRITICAL || a.getSeverity() == AlertSeverity.HIGH)
                .count();

        Instant startOfDay = LocalDate.now(ZoneId.systemDefault())
                .atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<LoginActivity> allLogins = loginRepo.findAll();
        long loginsToday = allLogins.stream()
                .filter(l -> l.getCreatedAt().isAfter(startOfDay) && l.isSuccess()).count();
        long failedToday = allLogins.stream()
                .filter(l -> l.getCreatedAt().isAfter(startOfDay) && !l.isSuccess()).count();

        Map<String, Long> byRole = userRepo.findAll().stream()
                .collect(Collectors.groupingBy(u -> u.getRole().name(), Collectors.counting()));

        // 7-day system-wide successful-login trend.
        ZoneId zone = ZoneId.systemDefault();
        Map<LocalDate, Long> counts = allLogins.stream().filter(LoginActivity::isSuccess)
                .collect(Collectors.groupingBy(l -> l.getCreatedAt().atZone(zone).toLocalDate(),
                        Collectors.counting()));
        List<ActivityPoint> trend = new ArrayList<>();
        LocalDate today = LocalDate.now(zone);
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            trend.add(new ActivityPoint(d.getDayOfWeek().toString().substring(0, 3),
                    counts.getOrDefault(d, 0L)));
        }

        return new AdminDashboard(totalUsers, activeUsers, totalCreds, alerts.size(),
                critical, loginsToday, failedToday, byRole, trend);
    }

    // ---- helpers ----

    private String prettyAction(String action) {
        if (action == null) return "";
        String s = action.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private String timeAgo(Instant then) {
        Duration d = Duration.between(then, Instant.now());
        long mins = d.toMinutes();
        if (mins < 1) return "just now";
        if (mins < 60) return mins + "m ago";
        long hours = d.toHours();
        if (hours < 24) return hours + "h ago";
        return d.toDays() + "d ago";
    }
}
