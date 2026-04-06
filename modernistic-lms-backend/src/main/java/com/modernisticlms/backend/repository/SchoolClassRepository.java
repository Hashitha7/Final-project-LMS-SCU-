package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByActiveStatus(int activeStatus);
    List<SchoolClass> findByTeacherId(Long teacherId);
}

