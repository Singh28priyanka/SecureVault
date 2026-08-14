package com.securevault.dto;

import java.util.List;
import java.util.Map;

/** DTOs for the Analytics Dashboard module. */
public final class DashboardDtos {

    private DashboardDtos() {}

    public record UserDashboard(
            int passwordHealthScore,
            long totalCredentials,
            long weakPasswords,
            long reusedPasswords,
            long expiredPasswords,
            long favorites,
            long activeShares,
            long unresolvedAlerts,
            Map<String, Long> credentialsByType,
            List<Integer> strengthDistribution,   // buckets: veryWeak..veryStrong
            List<ActivityPoint> loginTrend,
            List<RecentActivity> recentActivity) {}

    public record ActivityPoint(String label, long value) {}

    public record RecentActivity(String action, String detail, String timeAgo, String category) {}

    public record AdminDashboard(
            long totalUsers,
            long activeUsers,
            long totalCredentials,
            long totalAlerts,
            long criticalAlerts,
            long loginsToday,
            long failedLoginsToday,
            Map<String, Long> usersByRole,
            List<ActivityPoint> systemLoginTrend) {}
}
