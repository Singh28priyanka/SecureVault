package com.securevault.dto;

import java.util.List;

/** DTOs for the Password Generator module. */
public final class PasswordDtos {

    private PasswordDtos() {}

    public record GenerateRequest(
            int length,
            boolean includeLowercase,
            boolean includeUppercase,
            boolean includeNumbers,
            boolean includeSymbols,
            boolean excludeAmbiguous) {

        public GenerateRequest {
            if (length == 0) length = 16;
        }
    }

    public record GenerateResponse(String password, StrengthResult strength) {}

    public record StrengthRequest(String password) {}

    public record StrengthResult(
            int score,
            String label,
            double entropyBits,
            int length,
            boolean hasLower,
            boolean hasUpper,
            boolean hasDigit,
            boolean hasSymbol,
            List<String> feedback) {}
}
