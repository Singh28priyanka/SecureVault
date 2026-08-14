package com.securevault.controller;

import com.securevault.dto.CommonDtos.MessageResponse;
import com.securevault.dto.ShareDtos.*;
import com.securevault.security.CurrentUser;
import com.securevault.security.UserPrincipal;
import com.securevault.service.SharingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Secure Sharing module endpoints. */
@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final SharingService service;

    @PostMapping
    public ResponseEntity<MessageResponse> share(@Valid @RequestBody ShareRequest req) {
        UserPrincipal u = CurrentUser.get();
        service.share(u.getId(), u.getUsername(), req);
        return ResponseEntity.ok(new MessageResponse("Credential shared"));
    }

    @GetMapping("/with-me")
    public List<SharedWithMeResponse> sharedWithMe() {
        return service.sharedWithMe(CurrentUser.id());
    }

    @GetMapping("/by-me")
    public List<SharedByMeResponse> sharedByMe() {
        return service.sharedByMe(CurrentUser.id());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(@PathVariable Long id) {
        UserPrincipal u = CurrentUser.get();
        service.revoke(u.getId(), u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
