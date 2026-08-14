package com.securevault.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM authenticated encryption for vault secrets (data at rest).
 *
 * <p>Each secret is encrypted with a fresh random 12-byte IV. The output format
 * is {@code Base64( IV || ciphertext || GCM-tag )}, so every stored value is
 * self-describing and tamper-evident.
 */
@Service
public class EncryptionService {

    private static final int GCM_IV_LENGTH = 12;      // bytes
    private static final int GCM_TAG_LENGTH = 128;    // bits
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";

    private final byte[] rawKey;
    private final SecureRandom random = new SecureRandom();
    private SecretKey secretKey;

    public EncryptionService(@Value("${securevault.encryption.master-key}") String masterKey) {
        this.rawKey = masterKey.getBytes(StandardCharsets.UTF_8);
    }

    @PostConstruct
    void init() {
        // Normalise the supplied key material to exactly 32 bytes (AES-256).
        byte[] key = new byte[32];
        System.arraycopy(rawKey, 0, key, 0, Math.min(rawKey.length, 32));
        this.secretKey = new SecretKeySpec(key, "AES");
    }

    /** Encrypts UTF-8 plaintext and returns Base64(IV || ciphertext+tag). */
    public String encrypt(String plaintext) {
        if (plaintext == null) return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            byte[] out = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(cipherText, 0, out, iv.length, cipherText.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    /** Reverses {@link #encrypt}. Throws if the ciphertext has been tampered with. */
    public String decrypt(String encoded) {
        if (encoded == null) return null;
        try {
            byte[] in = Base64.getDecoder().decode(encoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(in, 0, iv, 0, GCM_IV_LENGTH);
            byte[] cipherText = new byte[in.length - GCM_IV_LENGTH];
            System.arraycopy(in, GCM_IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Decryption failed — data may be corrupted or tampered", e);
        }
    }
}
