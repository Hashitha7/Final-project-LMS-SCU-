package com.eduspark.backend.controller;

import com.eduspark.backend.model.Course;
import com.eduspark.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        course.setCreated(LocalDateTime.now());
        course.setUpdated(LocalDateTime.now());
        return courseRepository.save(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course updated) {
        return courseRepository.findById(id).map(course -> {
            course.setName(updated.getName());
            course.setDescription(updated.getDescription());
            course.setImageUrl(updated.getImageUrl());
            course.setTotalFee(updated.getTotalFee());
            course.setNoOfInstallments(updated.getNoOfInstallments());
            course.setNoOfSemesters(updated.getNoOfSemesters());
            course.setStatus(updated.getStatus());
            course.setStartDate(updated.getStartDate());
            course.setEndDate(updated.getEndDate());
            course.setUpdated(LocalDateTime.now());
            return ResponseEntity.ok(courseRepository.save(course));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
