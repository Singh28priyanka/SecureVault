package com.securevault.repository;

import com.securevault.entity.LoginActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface LoginActivityRepository extends JpaRepository<LoginActivity, Long> {
    List<LoginActivity> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
    List<LoginActivity> findByUserIdAndCreatedAtAfter(Long userId, Instant after);
    long countByUserIdAndSuccessFalseAndCreatedAtAfter(Long userId, Instant after);
}
