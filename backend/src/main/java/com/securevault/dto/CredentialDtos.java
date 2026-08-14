package com.securevault.dto;

import com.securevault.entity.Credential;
import com.securevault.entity.CredentialType;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

/** DTOs for the Password Vault module. */
public final class CredentialDtos {

    private CredentialDtos() {}

    /** Payload for create/update. {@code secret} is plaintext in transit (TLS), never stored. */
    public record CredentialRequest(
            @NotBlank String title,
            CredentialType type,
            String username,
            String secret,
            String url,
            String website,
            String notes,
            Long categoryId,
            Boolean favorite,
            Instant passwordExpiresAt) {}

    /** List/detail view. {@code secret} is only populated by the "reveal" endpoint. */
    public record CredentialResponse(
            Long id,
            String title,
            CredentialType type,
            String username,
            String secret,
            String url,
            String website,
            String notes,
            Long categoryId,
            boolean favorite,
            int strengthScore,
            Instant passwordExpiresAt,
            boolean expired,
            Instant lastUsedAt,
            Instant createdAt,
            Instant updatedAt) {

        public static CredentialResponse summary(Credential c) {
            return build(c, null);
        }

        public static CredentialResponse withSecret(Credential c, String secret) {
            return build(c, secret);
        }

        private static CredentialResponse build(Credential c, String secret) {
            boolean expired = c.getPasswordExpiresAt() != null
                    && c.getPasswordExpiresAt().isBefore(Instant.now());
            return new CredentialResponse(
                    c.getId(), c.getTitle(), c.getType(), c.getUsername(), secret,
                    c.getUrl(), c.getWebsite(), c.getNotes(), c.getCategoryId(),
                    c.isFavorite(), c.getStrengthScore(), c.getPasswordExpiresAt(),
                    expired, c.getLastUsedAt(), c.getCreatedAt(), c.getUpdatedAt());
        }
    }
}
