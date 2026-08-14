package com.securevault.service;

import com.securevault.dto.PasswordDtos.GenerateRequest;
import com.securevault.dto.PasswordDtos.StrengthResult;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Password Generator module: cryptographically-strong password generation and
 * a heuristic strength analyser (entropy + composition + common-pattern checks).
 */
@Service
public class PasswordService {

    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGITS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?";
    private static final String AMBIGUOUS = "il1Lo0O";

    private static final Pattern SEQUENTIAL = Pattern.compile(
            "(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def|qwe|wer|asd|zxc)",
            Pattern.CASE_INSENSITIVE);

    private static final List<String> COMMON = List.of(
            "password", "123456", "qwerty", "letmein", "admin", "welcome",
            "monkey", "dragon", "iloveyou", "abc123", "111111", "secret");

    private final SecureRandom random = new SecureRandom();

    /** Generates a random password honouring the requested composition rules. */
    public String generate(GenerateRequest req) {
        int length = Math.max(4, Math.min(req.length(), 128));

        StringBuilder pool = new StringBuilder();
        List<String> required = new ArrayList<>();
        if (req.includeLowercase()) { pool.append(LOWER); required.add(LOWER); }
        if (req.includeUppercase()) { pool.append(UPPER); required.add(UPPER); }
        if (req.includeNumbers())   { pool.append(DIGITS); required.add(DIGITS); }
        if (req.includeSymbols())   { pool.append(SYMBOLS); required.add(SYMBOLS); }
        if (pool.length() == 0) { pool.append(LOWER + UPPER + DIGITS); required.add(LOWER); }

        String charset = pool.toString();
        if (req.excludeAmbiguous()) {
            charset = strip(charset, AMBIGUOUS);
            required.replaceAll(s -> strip(s, AMBIGUOUS));
        }

        List<Character> chars = new ArrayList<>();
        // Guarantee at least one char from every selected class.
        for (String cls : required) {
            if (!cls.isEmpty()) chars.add(cls.charAt(random.nextInt(cls.length())));
        }
        while (chars.size() < length) {
            chars.add(charset.charAt(random.nextInt(charset.length())));
        }
        Collections.shuffle(chars, random);

        StringBuilder sb = new StringBuilder(length);
        chars.forEach(sb::append);
        return sb.toString();
    }

    /** Analyses a password and returns a 0-100 score, label and improvement tips. */
    public StrengthResult analyse(String password) {
        if (password == null) password = "";
        List<String> feedback = new ArrayList<>();

        boolean lower = password.matches(".*[a-z].*");
        boolean upper = password.matches(".*[A-Z].*");
        boolean digit = password.matches(".*\\d.*");
        boolean symbol = password.matches(".*[^a-zA-Z0-9].*");
        int len = password.length();

        // Character-space entropy estimate.
        int poolSize = (lower ? 26 : 0) + (upper ? 26 : 0) + (digit ? 10 : 0) + (symbol ? 32 : 0);
        double entropyBits = poolSize == 0 ? 0 : len * (Math.log(poolSize) / Math.log(2));

        int score = (int) Math.min(100, entropyBits * 1.15);

        if (len < 8) { score -= 25; feedback.add("Use at least 12 characters."); }
        else if (len < 12) { feedback.add("Longer passwords (12+) are much stronger."); }
        if (!upper) feedback.add("Add uppercase letters.");
        if (!digit) feedback.add("Add numbers.");
        if (!symbol) feedback.add("Add special characters.");

        String lc = password.toLowerCase();
        if (COMMON.stream().anyMatch(lc::contains)) {
            score -= 40; feedback.add("Avoid common words like \"password\" or \"qwerty\".");
        }
        if (SEQUENTIAL.matcher(password).find()) {
            score -= 15; feedback.add("Avoid sequential patterns (abc, 123, qwerty).");
        }
        if (password.matches("(.)\\1{2,}.*") || hasRepeats(password)) {
            score -= 10; feedback.add("Avoid repeated characters.");
        }

        score = Math.max(0, Math.min(100, score));
        String label = score >= 80 ? "Very Strong"
                : score >= 60 ? "Strong"
                : score >= 40 ? "Moderate"
                : score >= 20 ? "Weak" : "Very Weak";

        if (feedback.isEmpty()) feedback.add("Excellent — this is a strong password.");

        return new StrengthResult(score, label, Math.round(entropyBits * 10.0) / 10.0,
                len, lower, upper, digit, symbol, feedback);
    }

    /** Convenience: just the numeric score, used when caching credential strength. */
    public int score(String password) {
        return analyse(password).score();
    }

    private boolean hasRepeats(String s) {
        int run = 1;
        for (int i = 1; i < s.length(); i++) {
            if (s.charAt(i) == s.charAt(i - 1)) { if (++run >= 3) return true; }
            else run = 1;
        }
        return false;
    }

    private String strip(String src, String remove) {
        StringBuilder sb = new StringBuilder();
        for (char c : src.toCharArray()) if (remove.indexOf(c) < 0) sb.append(c);
        return sb.toString();
    }
}
