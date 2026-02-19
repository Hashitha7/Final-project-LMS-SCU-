package com.eduspark.backend.repository;

import com.eduspark.backend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTeacherId(Long teacherId);

    List<Lesson> findByActiveStatus(int activeStatus);
}
