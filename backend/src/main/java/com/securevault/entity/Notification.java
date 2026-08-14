package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** In-app notification (login alerts, sharing, expiry, risk alerts). */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(length = 512)
    private String body;

    /** LOGIN, SECURITY, SHARE, EXPIRY, RISK, SYSTEM */
    @Column(length = 20)
    private String type;

    @Builder.Default
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
