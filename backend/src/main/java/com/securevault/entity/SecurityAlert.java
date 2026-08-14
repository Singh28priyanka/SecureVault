package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A security alert raised by the monitoring / threat-detection engine. */
@Entity
@Table(name = "security_alerts", indexes = {
        @Index(name = "idx_alert_user", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(length = 512)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AlertSeverity severity = AlertSeverity.MEDIUM;

    /** e.g. NEW_DEVICE, BRUTE_FORCE, IMPOSSIBLE_TRAVEL, WEAK_PASSWORD, REUSED_PASSWORD */
    @Column(length = 40)
    private String type;

    @Builder.Default
    private boolean resolved = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
