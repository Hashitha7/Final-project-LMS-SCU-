package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Lesson;
import com.modernisticlms.backend.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public Lesson createLesson(@RequestBody Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long id, @RequestBody Lesson updated) {
        return lessonRepository.findById(id).map(lesson -> {
            lesson.setName(updated.getName());
            lesson.setDescription(updated.getDescription());
            lesson.setFee(updated.getFee());
            lesson.setImage(updated.getImage());
            lesson.setPreviewVideo(updated.getPreviewVideo());
            lesson.setPreviewVideoSize(updated.getPreviewVideoSize());
            lesson.setValidityDays(updated.getValidityDays());
            lesson.setActiveStatus(updated.getActiveStatus());
            lesson.setCourseId(updated.getCourseId());
            lesson.setLessonOrder(updated.getLessonOrder());
            lesson.setResourcesJson(updated.getResourcesJson());
            lesson.setTeacher(updated.getTeacher());
            return ResponseEntity.ok(lessonRepository.save(lesson));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
