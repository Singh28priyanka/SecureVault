package com.securevault.service;

import com.securevault.entity.*;
import com.securevault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Security Monitoring module: records login activity, tracks devices, and runs
 * lightweight anomaly heuristics (brute-force, new device, rapid failures) that
 * raise {@link SecurityAlert}s and notifications.
 */
@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final LoginActivityRepository loginRepo;
    private final DeviceRepository deviceRepo;
    private final SecurityAlertRepository alertRepo;
    private final NotificationService notifications;

    private static final int BRUTE_FORCE_THRESHOLD = 5;   // failures / 15 min

    /** Records a login attempt and evaluates anomaly heuristics. */
    public LoginActivity recordLogin(User user, boolean success, String ip, String userAgent) {
        boolean newDevice = false;
        String fingerprint = fingerprint(ip, userAgent);

        if (user != null && success) {
            newDevice = trackDevice(user.getId(), fingerprint, ip, userAgent);
        }

        LoginActivity activity = LoginActivity.builder()
                .userId(user == null ? null : user.getId())
                .username(user == null ? "unknown" : user.getUsername())
                .success(success)
                .ipAddress(ip)
                .userAgent(userAgent)
                .location(coarseLocation(ip))
                .deviceLabel(deviceLabel(userAgent))
                .build();

        // ---- Anomaly evaluation ----
        if (user != null) {
            long recentFailures = loginRepo.countByUserIdAndSuccessFalseAndCreatedAtAfter(
                    user.getId(), Instant.now().minus(15, ChronoUnit.MINUTES));

            if (!success && recentFailures + 1 >= BRUTE_FORCE_THRESHOLD) {
                activity.setAnomalous(true);
                activity.setAnomalyReason("Repeated failed logins");
                raiseAlert(user.getId(), AlertSeverity.HIGH, "BRUTE_FORCE",
                        "Possible brute-force attempt",
                        recentFailures + 1 + " failed logins in the last 15 minutes.");
            } else if (success && newDevice) {
                activity.setAnomalous(true);
                activity.setAnomalyReason("Login from a new device");
                raiseAlert(user.getId(), AlertSeverity.MEDIUM, "NEW_DEVICE",
                        "New device sign-in",
                        "A new device signed in: " + deviceLabel(userAgent) + " (" + ip + ").");
            }
        }
        return loginRepo.save(activity);
    }

    /** Registers/updates the device fingerprint; returns true when first seen. */
    private boolean trackDevice(Long userId, String fingerprint, String ip, String userAgent) {
        return deviceRepo.findByUserIdAndFingerprint(userId, fingerprint)
                .map(d -> {
                    d.setLastSeenAt(Instant.now());
                    d.setLastIp(ip);
                    deviceRepo.save(d);
                    return false;
                })
                .orElseGet(() -> {
                    boolean firstEver = deviceRepo.findByUserId(userId).isEmpty();
                    deviceRepo.save(Device.builder()
                            .userId(userId)
                            .fingerprint(fingerprint)
                            .label(deviceLabel(userAgent))
                            .lastIp(ip)
                            .location(coarseLocation(ip))
                            .trusted(firstEver)   // trust the enrolment device
                            .build());
                    return !firstEver;            // only "new" if not the first device
                });
    }

    public void raiseAlert(Long userId, AlertSeverity severity, String type,
                           String title, String message) {
        alertRepo.save(SecurityAlert.builder()
                .userId(userId).severity(severity).type(type)
                .title(title).message(message).build());
        notifications.push(userId, "SECURITY", title, message);
    }

    public List<SecurityAlert> alertsFor(Long userId) {
        return alertRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unresolvedCount(Long userId) {
        return alertRepo.countByUserIdAndResolvedFalse(userId);
    }

    public void resolveAlert(Long userId, Long alertId) {
        alertRepo.findById(alertId)
                .filter(a -> userId.equals(a.getUserId()))
                .ifPresent(a -> { a.setResolved(true); alertRepo.save(a); });
    }

    public List<LoginActivity> recentLogins(Long userId) {
        return loginRepo.findTop50ByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Device> devices(Long userId) {
        return deviceRepo.findByUserId(userId);
    }

    public void trustDevice(Long userId, Long deviceId, boolean trusted) {
        deviceRepo.findById(deviceId)
                .filter(d -> d.getUserId().equals(userId))
                .ifPresent(d -> { d.setTrusted(trusted); deviceRepo.save(d); });
    }

    public void removeDevice(Long userId, Long deviceId) {
        deviceRepo.findById(deviceId)
                .filter(d -> d.getUserId().equals(userId))
                .ifPresent(deviceRepo::delete);
    }

    // ---- Helpers (demo-grade fingerprint/geo derivation) ----

    private String fingerprint(String ip, String userAgent) {
        return Integer.toHexString((ip + "|" + deviceLabel(userAgent)).hashCode());
    }

    private String deviceLabel(String ua) {
        if (ua == null) return "Unknown device";
        String os = ua.contains("Windows") ? "Windows"
                : ua.contains("Mac") ? "macOS"
                : ua.contains("Android") ? "Android"
                : ua.contains("iPhone") || ua.contains("iPad") ? "iOS"
                : ua.contains("Linux") ? "Linux" : "Unknown OS";
        String browser = ua.contains("Edg") ? "Edge"
                : ua.contains("Chrome") ? "Chrome"
                : ua.contains("Firefox") ? "Firefox"
                : ua.contains("Safari") ? "Safari" : "Browser";
        return browser + " on " + os;
    }

    private String coarseLocation(String ip) {
        if (ip == null) return "Unknown";
        if (ip.startsWith("127.") || ip.equals("0:0:0:0:0:0:0:1") || ip.startsWith("192.168.")
                || ip.startsWith("10.")) {
            return "Local network";
        }
        return "Remote (" + ip + ")";
    }
}
