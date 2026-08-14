package com.securevault.controller;

import com.securevault.security.CurrentUser;
import com.securevault.security.UserPrincipal;
import com.securevault.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Reports &amp; Export module — PDF and Excel downloads. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/password-health.pdf")
    public ResponseEntity<byte[]> passwordHealthPdf() {
        UserPrincipal u = CurrentUser.get();
        byte[] pdf = reportService.passwordHealthPdf(u.getId(), u.getUsername());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"securevault-password-health.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/audit-log.xlsx")
    public ResponseEntity<byte[]> auditExcel() {
        byte[] xlsx = reportService.auditExcel(CurrentUser.id());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"securevault-audit-log.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsx);
    }
}
