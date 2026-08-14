package com.securevault.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.util.Utils;
import org.springframework.stereotype.Service;

/** Multi-factor authentication using time-based one-time passwords (TOTP / RFC 6238). */
@Service
public class MfaService {

    private static final String ISSUER = "SecureVault";

    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final ZxingPngQrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final CodeVerifier verifier =
            new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());

    /** Generates a fresh Base32 TOTP secret to associate with a user. */
    public String generateSecret() {
        return secretGenerator.generate();
    }

    /** Builds the otpauth:// URI that authenticator apps consume. */
    public String otpAuthUri(String account, String secret) {
        QrData data = new QrData.Builder()
                .label(account)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    /** Returns a data-URI PNG QR code for the given secret. */
    public String qrCodeDataUri(String account, String secret) {
        QrData data = new QrData.Builder()
                .label(account).secret(secret).issuer(ISSUER)
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6).period(30).build();
        try {
            byte[] png = qrGenerator.generate(data);
            return Utils.getDataUriForImage(png, qrGenerator.getImageMimeType());
        } catch (QrGenerationException e) {
            return null;
        }
    }

    /** Verifies a 6-digit code against the user's secret (with clock drift tolerance). */
    public boolean verify(String secret, String code) {
        return secret != null && code != null && verifier.isValidCode(secret, code.trim());
    }
}
