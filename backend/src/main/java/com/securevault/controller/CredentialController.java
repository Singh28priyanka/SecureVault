package com.securevault.controller;

import com.securevault.dto.CredentialDtos.CredentialRequest;
import com.securevault.dto.CredentialDtos.CredentialResponse;
import com.securevault.entity.CredentialType;
import com.securevault.security.CurrentUser;
import com.securevault.security.UserPrincipal;
import com.securevault.service.CredentialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Password Vault module endpoints. */
@RestController
@RequestMapping("/api/credentials")
@RequiredArgsConstructor
public class CredentialController {

    private final CredentialService service;

    @GetMapping
    public List<CredentialResponse> list(
            @RequestParam(required = false) CredentialType type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favorite) {
        return service.list(CurrentUser.id(), type, search, favorite);
    }

    @PostMapping
    public ResponseEntity<CredentialResponse> create(@Valid @RequestBody CredentialRequest req) {
        UserPrincipal u = CurrentUser.get();
        return ResponseEntity.ok(service.create(u.getId(), u.getUsername(), req));
    }

    @PutMapping("/{id}")
    public CredentialResponse update(@PathVariable Long id, @Valid @RequestBody CredentialRequest req) {
        UserPrincipal u = CurrentUser.get();
        return service.update(u.getId(), u.getUsername(), id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        UserPrincipal u = CurrentUser.get();
        service.delete(u.getId(), u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    /** Reveals the decrypted secret (audited). */
    @GetMapping("/{id}/reveal")
    public CredentialResponse reveal(@PathVariable Long id) {
        UserPrincipal u = CurrentUser.get();
        return service.reveal(u.getId(), u.getUsername(), id);
    }

    @PostMapping("/{id}/favorite")
    public CredentialResponse toggleFavorite(@PathVariable Long id) {
        return service.toggleFavorite(CurrentUser.id(), id);
    }
}
