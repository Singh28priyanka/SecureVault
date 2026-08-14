package com.securevault.service;

import com.securevault.dto.CredentialDtos.CredentialRequest;
import com.securevault.dto.CredentialDtos.CredentialResponse;
import com.securevault.entity.AlertSeverity;
import com.securevault.entity.Credential;
import com.securevault.entity.CredentialType;
import com.securevault.exception.ApiException;
import com.securevault.repository.CredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/** Password Vault module: encrypted CRUD, search, filtering and favourites. */
@Service
@RequiredArgsConstructor
public class CredentialService {

    private final CredentialRepository repository;
    private final EncryptionService encryption;
    private final PasswordService passwordService;
    private final AuditService audit;
    private final MonitoringService monitoring;

    @Transactional
    public CredentialResponse create(Long userId, String username, CredentialRequest req) {
        Credential c = new Credential();
        c.setOwnerId(userId);
        apply(c, req);
        c = repository.save(c);
        audit.log(userId, username, "CREDENTIAL_CREATE", "VAULT", "Added \"" + c.getTitle() + "\"");
        flagIfWeak(userId, c);
        return CredentialResponse.summary(c);
    }

    @Transactional
    public CredentialResponse update(Long userId, String username, Long id, CredentialRequest req) {
        Credential c = owned(userId, id);
        apply(c, req);
        c = repository.save(c);
        audit.log(userId, username, "CREDENTIAL_UPDATE", "VAULT", "Updated \"" + c.getTitle() + "\"");
        flagIfWeak(userId, c);
        return CredentialResponse.summary(c);
    }

    @Transactional
    public void delete(Long userId, String username, Long id) {
        Credential c = owned(userId, id);
        repository.delete(c);
        audit.log(userId, username, "CREDENTIAL_DELETE", "VAULT", "Deleted \"" + c.getTitle() + "\"");
    }

    @Transactional(readOnly = true)
    public List<CredentialResponse> list(Long userId, CredentialType type, String search, Boolean favorite) {
        return repository.findByOwnerIdOrderByUpdatedAtDesc(userId).stream()
                .filter(c -> type == null || c.getType() == type)
                .filter(c -> favorite == null || c.isFavorite() == favorite)
                .filter(c -> search == null || search.isBlank()
                        || contains(c.getTitle(), search) || contains(c.getUsername(), search)
                        || contains(c.getWebsite(), search) || contains(c.getUrl(), search))
                .map(CredentialResponse::summary)
                .toList();
    }

    /** Reveals the decrypted secret and records the access in the audit trail. */
    @Transactional
    public CredentialResponse reveal(Long userId, String username, Long id) {
        Credential c = owned(userId, id);
        c.setLastUsedAt(Instant.now());
        repository.save(c);
        audit.log(userId, username, "CREDENTIAL_REVEAL", "VAULT", "Revealed \"" + c.getTitle() + "\"");
        return CredentialResponse.withSecret(c, encryption.decrypt(c.getEncryptedSecret()));
    }

    @Transactional
    public CredentialResponse toggleFavorite(Long userId, Long id) {
        Credential c = owned(userId, id);
        c.setFavorite(!c.isFavorite());
        return CredentialResponse.summary(repository.save(c));
    }

    public long count(Long userId) {
        return repository.countByOwnerId(userId);
    }

    public List<Credential> ownedEntities(Long userId) {
        return repository.findByOwnerIdOrderByUpdatedAtDesc(userId);
    }

    // ---- internals ----

    private void apply(Credential c, CredentialRequest req) {
        c.setTitle(req.title());
        if (req.type() != null) c.setType(req.type());
        c.setUsername(req.username());
        c.setUrl(req.url());
        c.setWebsite(req.website());
        c.setNotes(req.notes());
        c.setCategoryId(req.categoryId());
        if (req.favorite() != null) c.setFavorite(req.favorite());
        c.setPasswordExpiresAt(req.passwordExpiresAt());

        if (req.secret() != null && !req.secret().isEmpty()) {
            c.setEncryptedSecret(encryption.encrypt(req.secret()));
            c.setStrengthScore(passwordService.score(req.secret()));
        }
    }

    private void flagIfWeak(Long userId, Credential c) {
        if (c.getType() != CredentialType.SECURE_NOTE
                && c.getStrengthScore() > 0 && c.getStrengthScore() < 40) {
            monitoring.raiseAlert(userId, AlertSeverity.LOW, "WEAK_PASSWORD",
                    "Weak password stored",
                    "\"" + c.getTitle() + "\" has a weak password (score "
                            + c.getStrengthScore() + "/100). Consider regenerating it.");
        }
    }

    private Credential owned(Long userId, Long id) {
        Credential c = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Credential not found"));
        if (!c.getOwnerId().equals(userId)) throw ApiException.forbidden("Not your credential");
        return c;
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle.toLowerCase());
    }
}
