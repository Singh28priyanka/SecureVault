package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Immutable audit trail entry. Every meaningful action (login, vault access,
 * share, security event) is recorded here for the Audit Logging module.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "userId"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_time", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String username;

    /** e.g. LOGIN_SUCCESS, VAULT_VIEW, CREDENTIAL_CREATE, SHARE_GRANT ... */
    @Column(nullable = false, length = 60)
    private String action;

    /** Broad grouping: AUTH, VAULT, SHARE, SECURITY, SYSTEM. */
    @Column(length = 20)
    private String category;

    @Column(length = 512)
    private String detail;

    private String ipAddress;
    private String userAgent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
