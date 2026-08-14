package com.securevault.repository;

import com.securevault.entity.SecurityAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SecurityAlert> findByUserIdAndResolvedFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndResolvedFalse(Long userId);
    List<SecurityAlert> findAllByOrderByCreatedAtDesc();
}
