package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByTeacherId(Long teacherId);
}

