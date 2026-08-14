package com.securevault.dto;

import com.securevault.entity.SharePermission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/** DTOs for the Secure Sharing module. */
public final class ShareDtos {

    private ShareDtos() {}

    public record ShareRequest(
            @NotNull Long credentialId,
            @NotBlank String recipientEmail,
            SharePermission permission,
            Instant expiresAt) {}

    public record SharedWithMeResponse(
            Long shareId,
            Long credentialId,
            String title,
            String ownerUsername,
            String permission,
            Instant expiresAt,
            CredentialDtos.CredentialResponse credential) {}

    public record SharedByMeResponse(
            Long shareId,
            Long credentialId,
            String title,
            String recipientEmail,
            String permission,
            boolean active,
            Instant expiresAt,
            Instant createdAt) {}
}
