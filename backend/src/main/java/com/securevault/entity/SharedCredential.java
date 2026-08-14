package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A share grant that lets another user access one of the owner's credentials
 * at a given permission level, optionally with an expiry (temporary access).
 */
@Entity
@Table(name = "shared_credentials", indexes = {
        @Index(name = "idx_share_recipient", columnList = "recipientId"),
        @Index(name = "idx_share_credential", columnList = "credentialId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long credentialId;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private Long recipientId;

    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SharePermission permission = SharePermission.VIEW_ONLY;

    /** Null == never expires; otherwise the grant is revoked automatically. */
    private Instant expiresAt;

    @Builder.Default
    private boolean revoked = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    /** A grant is active when not revoked and not past its expiry. */
    public boolean isActive() {
        if (revoked) return false;
        return expiresAt == null || expiresAt.isAfter(Instant.now());
    }
}
