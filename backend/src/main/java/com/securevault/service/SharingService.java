package com.securevault.service;

import com.securevault.dto.CredentialDtos.CredentialResponse;
import com.securevault.dto.ShareDtos.*;
import com.securevault.entity.Credential;
import com.securevault.entity.SharePermission;
import com.securevault.entity.SharedCredential;
import com.securevault.entity.User;
import com.securevault.exception.ApiException;
import com.securevault.repository.CredentialRepository;
import com.securevault.repository.SharedCredentialRepository;
import com.securevault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/** Secure Sharing module: grant, list, and revoke credential shares. */
@Service
@RequiredArgsConstructor
public class SharingService {

    private final SharedCredentialRepository shareRepo;
    private final CredentialRepository credentialRepo;
    private final UserRepository userRepo;
    private final EncryptionService encryption;
    private final AuditService audit;
    private final NotificationService notifications;

    @Transactional
    public void share(Long ownerId, String ownerName, ShareRequest req) {
        Credential credential = credentialRepo.findById(req.credentialId())
                .orElseThrow(() -> ApiException.notFound("Credential not found"));
        if (!credential.getOwnerId().equals(ownerId))
            throw ApiException.forbidden("You can only share your own credentials");

        User recipient = userRepo.findByEmail(req.recipientEmail())
                .orElseThrow(() -> ApiException.badRequest("No SecureVault user with that email"));
        if (recipient.getId().equals(ownerId))
            throw ApiException.badRequest("You cannot share a credential with yourself");

        SharedCredential share = SharedCredential.builder()
                .credentialId(credential.getId())
                .ownerId(ownerId)
                .recipientId(recipient.getId())
                .recipientEmail(recipient.getEmail())
                .permission(req.permission() == null ? SharePermission.VIEW_ONLY : req.permission())
                .expiresAt(req.expiresAt())
                .build();
        shareRepo.save(share);

        audit.log(ownerId, ownerName, "SHARE_GRANT", "SHARE",
                "Shared \"" + credential.getTitle() + "\" with " + recipient.getEmail());
        notifications.push(recipient.getId(), "SHARE", "A credential was shared with you",
                ownerName + " shared \"" + credential.getTitle() + "\" with you.");
    }

    @Transactional(readOnly = true)
    public List<SharedWithMeResponse> sharedWithMe(Long userId) {
        return shareRepo.findByRecipientIdAndRevokedFalse(userId).stream()
                .filter(SharedCredential::isActive)
                .map(s -> {
                    Credential c = credentialRepo.findById(s.getCredentialId()).orElse(null);
                    if (c == null) return null;
                    User owner = userRepo.findById(s.getOwnerId()).orElse(null);
                    // View-only and above may see the secret; secret decrypted server-side.
                    String secret = encryption.decrypt(c.getEncryptedSecret());
                    return new SharedWithMeResponse(
                            s.getId(), c.getId(), c.getTitle(),
                            owner == null ? "unknown" : owner.getUsername(),
                            s.getPermission().name(), s.getExpiresAt(),
                            CredentialResponse.withSecret(c, secret));
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SharedByMeResponse> sharedByMe(Long userId) {
        return shareRepo.findByOwnerId(userId).stream()
                .map(s -> {
                    Optional<Credential> c = credentialRepo.findById(s.getCredentialId());
                    return new SharedByMeResponse(
                            s.getId(), s.getCredentialId(),
                            c.map(Credential::getTitle).orElse("(deleted)"),
                            s.getRecipientEmail(), s.getPermission().name(),
                            s.isActive(), s.getExpiresAt(), s.getCreatedAt());
                })
                .toList();
    }

    @Transactional
    public void revoke(Long ownerId, String ownerName, Long shareId) {
        SharedCredential share = shareRepo.findById(shareId)
                .orElseThrow(() -> ApiException.notFound("Share not found"));
        if (!share.getOwnerId().equals(ownerId))
            throw ApiException.forbidden("Not your share");
        share.setRevoked(true);
        shareRepo.save(share);
        audit.log(ownerId, ownerName, "SHARE_REVOKE", "SHARE", "Revoked share #" + shareId);
    }

    public long activeShareCount(Long userId) {
        return shareRepo.findByOwnerId(userId).stream().filter(SharedCredential::isActive).count();
    }
}
