package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.Institute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InstituteRepository extends JpaRepository<Institute, Long> {
    Optional<Institute> findByEmail(String email);

    Optional<Institute> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}

