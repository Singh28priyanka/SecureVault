package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A device/browser fingerprint seen for a user (device management + tracking). */
@Entity
@Table(name = "devices", indexes = {
        @Index(name = "idx_device_user", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String label;        // e.g. "Chrome on macOS"
    private String fingerprint;  // hash of user-agent + ip
    private String lastIp;
    private String location;

    @Builder.Default
    private boolean trusted = false;

    private Instant firstSeenAt;
    private Instant lastSeenAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (firstSeenAt == null) firstSeenAt = now;
        lastSeenAt = now;
    }
}
