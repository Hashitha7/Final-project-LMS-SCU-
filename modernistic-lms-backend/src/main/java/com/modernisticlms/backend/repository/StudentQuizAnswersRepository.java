package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.StudentQuizAnswers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentQuizAnswersRepository extends JpaRepository<StudentQuizAnswers, Long> {
    List<StudentQuizAnswers> findByStudentIdOrderByEndDateTimeDesc(Long studentId);

    List<StudentQuizAnswers> findByQuizIdOrderByEndDateTimeDesc(Long quizId);

    List<StudentQuizAnswers> findByQuizTeacherIdOrderByEndDateTimeDesc(Long teacherId);
}
