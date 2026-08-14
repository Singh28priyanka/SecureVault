package com.securevault.dto;

import com.securevault.entity.User;

import java.time.Instant;

/** DTOs describing users (never expose password hashes / MFA secrets). */
public final class UserDtos {

    private UserDtos() {}

    public record UserProfile(
            Long id,
            String username,
            String email,
            String fullName,
            String role,
            boolean mfaEnabled,
            boolean enabled,
            Instant lastLoginAt,
            Instant createdAt) {

        public static UserProfile from(User u) {
            return new UserProfile(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(),
                    u.getRole().name(), u.isMfaEnabled(), u.isEnabled(),
                    u.getLastLoginAt(), u.getCreatedAt());
        }
    }
}
