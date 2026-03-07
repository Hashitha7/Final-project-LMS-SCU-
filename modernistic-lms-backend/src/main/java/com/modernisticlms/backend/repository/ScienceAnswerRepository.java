package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.ScienceAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScienceAnswerRepository extends JpaRepository<ScienceAnswer, Long> {
    List<ScienceAnswer> findByTeacherName(String teacherName);

    List<ScienceAnswer> findByStudentName(String studentName);

    List<ScienceAnswer> findByGrade(String grade);

    List<ScienceAnswer> findBySubject(String subject);

    List<ScienceAnswer> findByGradeAndSubject(String grade, String subject);
}
