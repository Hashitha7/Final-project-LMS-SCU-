package com.eduspark.backend.controller;

import com.eduspark.backend.model.Lesson;
import com.eduspark.backend.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    @Autowired
    private LessonRepository lessonRepository;

    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long id) {
        return lessonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Lesson createLesson(@RequestBody Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long id, @RequestBody Lesson updated) {
        return lessonRepository.findById(id).map(lesson -> {
            lesson.setName(updated.getName());
            lesson.setDescription(updated.getDescription());
            lesson.setFee(updated.getFee());
            lesson.setImage(updated.getImage());
            lesson.setPreviewVideo(updated.getPreviewVideo());
            lesson.setValidityDays(updated.getValidityDays());
            lesson.setActiveStatus(updated.getActiveStatus());
            lesson.setTeacher(updated.getTeacher());
            return ResponseEntity.ok(lessonRepository.save(lesson));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
