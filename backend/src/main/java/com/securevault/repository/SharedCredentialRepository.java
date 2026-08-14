package com.securevault.repository;

import com.securevault.entity.SharedCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharedCredentialRepository extends JpaRepository<SharedCredential, Long> {
    List<SharedCredential> findByRecipientIdAndRevokedFalse(Long recipientId);
    List<SharedCredential> findByOwnerId(Long ownerId);
    List<SharedCredential> findByCredentialId(Long credentialId);
    long countByOwnerId(Long ownerId);
}
