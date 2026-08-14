package com.securevault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTOs for the Authentication &amp; Access Control module. */
public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 40) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            String fullName) {}

    public record LoginRequest(
            @NotBlank String usernameOrEmail,
            @NotBlank String password,
            String mfaCode) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            long expiresInMs,
            boolean mfaRequired,
            UserDtos.UserProfile user) {}

    public record MfaSetupResponse(String secret, String otpAuthUri, String qrImageBase64) {}

    public record MfaVerifyRequest(@NotBlank String code) {}
}
