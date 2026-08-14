package com.securevault.repository;

import com.securevault.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByUserId(Long userId);
    Optional<Device> findByUserIdAndFingerprint(Long userId, String fingerprint);
}
