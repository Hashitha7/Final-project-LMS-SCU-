package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTeacherId(Long teacherId);

    List<Lesson> findByActiveStatus(int activeStatus);
}

