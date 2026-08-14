package com.securevault.service;

import com.securevault.entity.Notification;
import com.securevault.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Notification module: creates in-app notifications and (best-effort) emails.
 * Email failures are swallowed so notifications never block the main flow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;
    private final JavaMailSender mailSender;

    public Notification push(Long userId, String type, String title, String body) {
        Notification n = Notification.builder()
                .userId(userId).type(type).title(title).body(body).build();
        return repository.save(n);
    }

    public void email(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("[SecureVault] " + subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            log.debug("Email notification skipped ({}): {}", to, e.getMessage());
        }
    }

    public List<Notification> list(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(Long userId, Long id) {
        repository.findById(id)
                .filter(n -> n.getUserId().equals(userId))
                .ifPresent(n -> { n.setRead(true); repository.save(n); });
    }

    public void markAllRead(Long userId) {
        List<Notification> all = repository.findByUserIdOrderByCreatedAtDesc(userId);
        all.forEach(n -> n.setRead(true));
        repository.saveAll(all);
    }
}
