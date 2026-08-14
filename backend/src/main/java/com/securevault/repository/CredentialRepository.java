package com.securevault.repository;

import com.securevault.entity.Credential;
import com.securevault.entity.CredentialType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CredentialRepository extends JpaRepository<Credential, Long> {

    List<Credential> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);

    List<Credential> findByOwnerIdAndType(Long ownerId, CredentialType type);

    List<Credential> findByOwnerIdAndFavoriteTrue(Long ownerId);

    long countByOwnerId(Long ownerId);

    List<Credential> findByOwnerIdAndTitleContainingIgnoreCase(Long ownerId, String title);
}
