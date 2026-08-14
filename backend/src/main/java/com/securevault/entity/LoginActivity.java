package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A single login attempt, feeding login monitoring and anomaly detection. */
@Entity
@Table(name = "login_activities", indexes = {
        @Index(name = "idx_login_user", columnList = "userId"),
        @Index(name = "idx_login_time", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String username;

    @Column(nullable = false)
    private boolean success;

    private String ipAddress;
    private String userAgent;
    private String location;   // coarse, derived from IP (demo value)
    private String deviceLabel;

    /** True when the monitoring heuristics flagged this attempt as anomalous. */
    @Builder.Default
    private boolean anomalous = false;

    private String anomalyReason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
