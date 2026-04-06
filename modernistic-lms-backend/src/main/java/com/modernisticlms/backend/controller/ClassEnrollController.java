package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.ClassEnroll;
import com.modernisticlms.backend.model.SchoolClass;
import com.modernisticlms.backend.model.Student;
import com.modernisticlms.backend.repository.ClassEnrollRepository;
import com.modernisticlms.backend.repository.SchoolClassRepository;
import com.modernisticlms.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/class-enrollments")
public class ClassEnrollController {

    @Autowired
    private ClassEnrollRepository classEnrollRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Get all enrollments (admin/teacher use)
    @GetMapping
    public List<ClassEnroll> getAll() {
        return classEnrollRepository.findAll();
    }

    // Get enrollments for a specific student
    @GetMapping("/student/{studentId}")
    public List<ClassEnroll> getByStudent(@PathVariable Long studentId) {
        return classEnrollRepository.findByStudentId(studentId);
    }

    // Get enrollments for a specific class
    @GetMapping("/class/{classId}")
    public List<ClassEnroll> getByClass(@PathVariable Long classId) {
        return classEnrollRepository.findBySchoolClassId(classId);
    }

    // Check if a student is enrolled in a class
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkEnrollment(
            @RequestParam Long studentId,
            @RequestParam Long classId) {
        List<ClassEnroll> enrollments = classEnrollRepository.findByStudentId(studentId);
        boolean enrolled = enrollments.stream()
                .anyMatch(e -> e.getSchoolClass().getId().equals(classId));
        String enrollType = enrolled ? enrollments.stream()
                .filter(e -> e.getSchoolClass().getId().equals(classId))
                .map(ClassEnroll::getEnrollType)
                .findFirst().orElse(null) : null;

        Map<String, Object> result = new HashMap<>();
        result.put("enrolled", enrolled);
        result.put("enrollType", enrollType);
        return ResponseEntity.ok(result);
    }

    // Enroll a student — triggered by payment or free-trial selection
    @PostMapping
    public ResponseEntity<ClassEnroll> enroll(@RequestBody Map<String, Object> body) {
        Long classId = Long.valueOf(body.get("classId").toString());
        Long studentId = Long.valueOf(body.get("studentId").toString());
        String enrollType = body.getOrDefault("enrollType", "PAID").toString(); // PAID | FREE_TRIAL

        // Check already enrolled
        List<ClassEnroll> existing = classEnrollRepository.findByStudentId(studentId);
        boolean alreadyEnrolled = existing.stream()
                .anyMatch(e -> e.getSchoolClass().getId().equals(classId));
        if (alreadyEnrolled) {
            return ResponseEntity.badRequest().build();
        }

        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ClassEnroll enroll = new ClassEnroll();
        enroll.setSchoolClass(schoolClass);
        enroll.setStudent(student);
        enroll.setStatus("active");
        enroll.setEnrollType(enrollType);
        enroll.setType(enrollType.equals("FREE_TRIAL") ? "trial" : "paid");
        enroll.setDateTime(LocalDateTime.now());

        return ResponseEntity.ok(classEnrollRepository.save(enroll));
    }

    // Un-enroll a student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unenroll(@PathVariable Long id) {
        classEnrollRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
