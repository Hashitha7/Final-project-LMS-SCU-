package com.eduspark.backend.controller;

import com.eduspark.backend.model.Teacher;
import com.eduspark.backend.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Teacher> createTeacher(@RequestBody Teacher teacher) {
        if (teacher.getPassword() != null) {
            teacher.setPassword(passwordEncoder.encode(teacher.getPassword()));
        }
        return ResponseEntity.ok(teacherRepository.save(teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher updated) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setName(updated.getName());
            teacher.setEmail(updated.getEmail());
            teacher.setMobile(updated.getMobile());
            teacher.setGender(updated.getGender());
            teacher.setDob(updated.getDob());
            teacher.setQualification(updated.getQualification());
            teacher.setStatus(updated.getStatus());
            teacher.setDescription(updated.getDescription());
            teacher.setImageUrl(updated.getImageUrl());
            if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
                teacher.setPassword(passwordEncoder.encode(updated.getPassword()));
            }
            return ResponseEntity.ok(teacherRepository.save(teacher));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
