package com.securevault.controller;

import com.securevault.dto.DashboardDtos.UserDashboard;
import com.securevault.security.CurrentUser;
import com.securevault.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Analytics Dashboard module — user dashboard. */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analytics;

    @GetMapping
    public UserDashboard dashboard() {
        return analytics.userDashboard(CurrentUser.id());
    }
}
