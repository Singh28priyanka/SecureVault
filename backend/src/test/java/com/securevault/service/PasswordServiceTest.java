package com.securevault.service;

import com.securevault.dto.PasswordDtos.GenerateRequest;
import com.securevault.dto.PasswordDtos.StrengthResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordServiceTest {

    private final PasswordService service = new PasswordService();

    @Test
    void generate_respectsLengthAndComposition() {
        GenerateRequest req = new GenerateRequest(24, true, true, true, true, false);
        String pwd = service.generate(req);

        assertEquals(24, pwd.length());
        assertTrue(pwd.matches(".*[a-z].*"), "should contain lowercase");
        assertTrue(pwd.matches(".*[A-Z].*"), "should contain uppercase");
        assertTrue(pwd.matches(".*\\d.*"), "should contain a digit");
        assertTrue(pwd.matches(".*[^a-zA-Z0-9].*"), "should contain a symbol");
    }

    @Test
    void generate_excludeAmbiguous_removesLookAlikes() {
        GenerateRequest req = new GenerateRequest(60, true, true, true, false, true);
        String pwd = service.generate(req);
        for (char c : "il1Lo0O".toCharArray()) {
            assertEquals(-1, pwd.indexOf(c), "should not contain ambiguous char " + c);
        }
    }

    @Test
    void analyse_commonPassword_isVeryWeak() {
        StrengthResult r = service.analyse("password");
        assertTrue(r.score() < 40, "common password should score low, was " + r.score());
        assertFalse(r.feedback().isEmpty());
    }

    @Test
    void analyse_strongPassword_isVeryStrong() {
        StrengthResult r = service.analyse("9@[6HPd!b2V[JNgcAmdQ");
        assertTrue(r.score() >= 80, "strong password should score high, was " + r.score());
        assertEquals("Very Strong", r.label());
    }

    @Test
    void analyse_reportsCompositionFlags() {
        StrengthResult r = service.analyse("abcABC123!");
        assertTrue(r.hasLower() && r.hasUpper() && r.hasDigit() && r.hasSymbol());
        assertTrue(r.entropyBits() > 0);
    }
}
