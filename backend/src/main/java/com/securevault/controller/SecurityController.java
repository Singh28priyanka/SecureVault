package com.securevault.controller;

import com.securevault.dto.CommonDtos.MessageResponse;
import com.securevault.entity.Device;
import com.securevault.entity.LoginActivity;
import com.securevault.entity.SecurityAlert;
import com.securevault.security.CurrentUser;
import com.securevault.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Security Monitoring module — alerts, login activity, devices. */
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityController {

    private final MonitoringService monitoring;

    @GetMapping("/alerts")
    public List<SecurityAlert> alerts() {
        return monitoring.alertsFor(CurrentUser.id());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<MessageResponse> resolve(@PathVariable Long id) {
        monitoring.resolveAlert(CurrentUser.id(), id);
        return ResponseEntity.ok(new MessageResponse("Alert resolved"));
    }

    @GetMapping("/logins")
    public List<LoginActivity> logins() {
        return monitoring.recentLogins(CurrentUser.id());
    }

    @GetMapping("/devices")
    public List<Device> devices() {
        return monitoring.devices(CurrentUser.id());
    }

    @PostMapping("/devices/{id}/trust")
    public ResponseEntity<MessageResponse> trust(@PathVariable Long id,
                                                 @RequestParam(defaultValue = "true") boolean trusted) {
        monitoring.trustDevice(CurrentUser.id(), id, trusted);
        return ResponseEntity.ok(new MessageResponse("Device updated"));
    }

    @DeleteMapping("/devices/{id}")
    public ResponseEntity<Void> removeDevice(@PathVariable Long id) {
        monitoring.removeDevice(CurrentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
