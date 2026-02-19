package com.eduspark.backend.repository;

import com.eduspark.backend.model.InstituteTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstituteTeacherRepository extends JpaRepository<InstituteTeacher, Long> {
    List<InstituteTeacher> findByInstituteId(Long instituteId);

    List<InstituteTeacher> findByTeacherId(Long teacherId);

    Optional<InstituteTeacher> findByInstituteIdAndTeacherId(Long instituteId, Long teacherId);
}
