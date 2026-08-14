package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A single stored credential. The sensitive secret (password / API key / note
 * body) is persisted only as an AES-256-GCM ciphertext in {@code encryptedSecret}
 * — the plaintext never touches the database.
 */
@Entity
@Table(name = "credentials", indexes = {
        @Index(name = "idx_cred_owner", columnList = "ownerId"),
        @Index(name = "idx_cred_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Credential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private CredentialType type = CredentialType.WEBSITE_LOGIN;

    private String username;   // login / account identifier (not secret)
    private String url;
    private String website;

    /** AES-256-GCM ciphertext of the secret value (Base64). Never null for secrets. */
    @Column(name = "encrypted_secret", length = 4096)
    private String encryptedSecret;

    @Column(length = 2048)
    private String notes;

    private Long categoryId;

    @Builder.Default
    private boolean favorite = false;

    /** Cached password-strength score (0-100) computed at save time. */
    @Builder.Default
    private int strengthScore = 0;

    /** Optional rotation reminder; a credential is "stale" once past this date. */
    private Instant passwordExpiresAt;

    private Instant lastUsedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
