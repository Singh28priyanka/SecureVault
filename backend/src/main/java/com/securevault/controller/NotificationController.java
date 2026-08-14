package com.securevault.controller;

import com.securevault.dto.CommonDtos.MessageResponse;
import com.securevault.entity.Notification;
import com.securevault.security.CurrentUser;
import com.securevault.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Notification module endpoints. */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @GetMapping
    public List<Notification> list() {
        return service.list(CurrentUser.id());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread() {
        return Map.of("count", service.unreadCount(CurrentUser.id()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<MessageResponse> read(@PathVariable Long id) {
        service.markRead(CurrentUser.id(), id);
        return ResponseEntity.ok(new MessageResponse("Marked read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<MessageResponse> readAll() {
        service.markAllRead(CurrentUser.id());
        return ResponseEntity.ok(new MessageResponse("All marked read"));
    }
}
