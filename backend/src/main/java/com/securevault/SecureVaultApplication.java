package com.securevault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SecureVault — Full-Stack Password Vault &amp; Credential Management System.
 *
 * <p>Entry point for the Spring Boot backend. Exposes a secured REST API for
 * authentication/MFA, encrypted credential storage, password generation,
 * secure sharing, security monitoring, audit logging, analytics and reports.
 */
@SpringBootApplication
@EnableScheduling
public class SecureVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureVaultApplication.class, args);
    }
}
