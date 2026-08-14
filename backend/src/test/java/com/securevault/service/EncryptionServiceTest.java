package com.securevault.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EncryptionServiceTest {

    private EncryptionService service;

    @BeforeEach
    void setUp() {
        service = new EncryptionService("0123456789abcdef0123456789abcdef");
        service.init();
    }

    @Test
    void encryptThenDecrypt_returnsOriginalPlaintext() {
        String secret = "Sup3r-S3cr3t!Passw0rd#2025";
        String cipher = service.encrypt(secret);

        assertNotNull(cipher);
        assertNotEquals(secret, cipher, "ciphertext must not equal plaintext");
        assertEquals(secret, service.decrypt(cipher));
    }

    @Test
    void encrypt_producesDifferentCiphertextEachTime_dueToRandomIv() {
        String secret = "same-input";
        assertNotEquals(service.encrypt(secret), service.encrypt(secret),
                "random IV should make each ciphertext unique");
    }

    @Test
    void decrypt_tamperedCiphertext_throws() {
        String cipher = service.encrypt("hello");
        String tampered = cipher.substring(0, cipher.length() - 2) + "AA";
        assertThrows(IllegalStateException.class, () -> service.decrypt(tampered));
    }

    @Test
    void handlesNullGracefully() {
        assertNull(service.encrypt(null));
        assertNull(service.decrypt(null));
    }
}
