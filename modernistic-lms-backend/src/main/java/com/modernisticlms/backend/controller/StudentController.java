package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Student;
import com.modernisticlms.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER','STUDENT')")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INSTITUTE')")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        if (student.getPassword() != null) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','STUDENT')")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student updated) {
        return studentRepository.findById(id).map(student -> {
            student.setName(updated.getName());
            student.setEmail(updated.getEmail());
            student.setMobile(updated.getMobile());
            student.setGender(updated.getGender());
            student.setDob(updated.getDob());
            student.setGrade(updated.getGrade());
            student.setSchool(updated.getSchool());
            student.setAddress(updated.getAddress());
            student.setDistrict(updated.getDistrict());
            student.setProvince(updated.getProvince());
            student.setStatus(updated.getStatus());
            if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
                student.setPassword(passwordEncoder.encode(updated.getPassword()));
            }
            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTITUTE')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

