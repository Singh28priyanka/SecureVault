package com.securevault.controller;

import com.securevault.entity.AuditLog;
import com.securevault.security.CurrentUser;
import com.securevault.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

/** Audit Logging module endpoints. */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public Page<AuditLog> myLogs(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "25") int size) {
        return auditService.forUser(CurrentUser.id(), PageRequest.of(page, Math.min(size, 100)));
    }
}
