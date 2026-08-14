package com.securevault.service;

import com.securevault.entity.AuditLog;
import com.securevault.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Audit Logging module: records an immutable trail of significant actions. */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;

    public void log(Long userId, String username, String action, String category, String detail) {
        AuditLog entry = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .category(category)
                .detail(detail)
                .ipAddress(currentIp())
                .userAgent(currentUserAgent())
                .build();
        repository.save(entry);
    }

    public Page<AuditLog> forUser(Long userId, Pageable pageable) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<AuditLog> all(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }

    private String currentIp() {
        HttpServletRequest req = currentRequest();
        if (req == null) return "system";
        String xf = req.getHeader("X-Forwarded-For");
        return xf != null ? xf.split(",")[0].trim() : req.getRemoteAddr();
    }

    private String currentUserAgent() {
        HttpServletRequest req = currentRequest();
        return req == null ? "system" : req.getHeader("User-Agent");
    }

    private HttpServletRequest currentRequest() {
        var attrs = RequestContextHolder.getRequestAttributes();
        return attrs instanceof ServletRequestAttributes sra ? sra.getRequest() : null;
    }
}
