package com.securevault.controller;

import com.securevault.dto.AuthDtos.*;
import com.securevault.dto.CommonDtos.MessageResponse;
import com.securevault.dto.UserDtos.UserProfile;
import com.securevault.security.CurrentUser;
import com.securevault.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Authentication &amp; Access Control endpoints. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                              HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(req, http));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me() {
        return ResponseEntity.ok(authService.profile(CurrentUser.id()));
    }

    // ---- MFA management (authenticated) ----

    @PostMapping("/mfa/setup")
    public ResponseEntity<MfaSetupResponse> mfaSetup() {
        return ResponseEntity.ok(authService.beginMfaSetup(CurrentUser.id()));
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<MessageResponse> mfaEnable(@Valid @RequestBody MfaVerifyRequest req) {
        authService.enableMfa(CurrentUser.id(), req.code());
        return ResponseEntity.ok(new MessageResponse("MFA enabled"));
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<MessageResponse> mfaDisable() {
        authService.disableMfa(CurrentUser.id());
        return ResponseEntity.ok(new MessageResponse("MFA disabled"));
    }
}
