package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    Optional<Student> findByMobile(String mobile);

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);
}

