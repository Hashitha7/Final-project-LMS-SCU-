package com.eduspark.backend.repository;

import com.eduspark.backend.model.ClassEnroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassEnrollRepository extends JpaRepository<ClassEnroll, Long> {
    List<ClassEnroll> findByStudentId(Long studentId);

    List<ClassEnroll> findBySchoolClassId(Long classId);
}
