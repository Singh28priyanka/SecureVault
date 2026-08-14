package com.securevault.controller;

import com.securevault.dto.DashboardDtos.AdminDashboard;
import com.securevault.dto.UserDtos.UserProfile;
import com.securevault.entity.SecurityAlert;
import com.securevault.repository.SecurityAlertRepository;
import com.securevault.repository.UserRepository;
import com.securevault.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin Dashboard module — restricted to ADMIN (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AnalyticsService analytics;
    private final UserRepository userRepository;
    private final SecurityAlertRepository alertRepository;

    @GetMapping("/dashboard")
    public AdminDashboard dashboard() {
        return analytics.adminDashboard();
    }

    @GetMapping("/users")
    public List<UserProfile> users() {
        return userRepository.findAll().stream().map(UserProfile::from).toList();
    }

    @GetMapping("/alerts")
    public List<SecurityAlert> alerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }
}
