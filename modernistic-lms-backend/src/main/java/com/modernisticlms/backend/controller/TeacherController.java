package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Teacher;
import com.modernisticlms.backend.repository.TeacherRepository;
import com.modernisticlms.backend.repository.InstituteRepository;
import com.modernisticlms.backend.security.UserDetailsImpl;
import com.modernisticlms.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

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
        // Fix empty strings causing SQL unique constraint violations
        if (teacher.getMobile() != null && teacher.getMobile().isBlank()) {
            teacher.setMobile(null);
        }
        if (teacher.getUrlName() != null && teacher.getUrlName().isBlank()) {
            teacher.setUrlName(null);
        }

        // Save plain password BEFORE encoding — needed to send in email
        String plainPassword = teacher.getPassword();

        if (plainPassword != null && !plainPassword.isBlank()) {
            teacher.setPassword(passwordEncoder.encode(plainPassword));
        }

        Teacher saved = teacherRepository.save(teacher);

        // ── Send emails asynchronously (won't block the response) ──
        try {
            // 1. Welcome email → Teacher with credentials
            if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
                emailService.sendTeacherWelcomeEmail(
                        saved.getEmail(),
                        saved.getName() != null ? saved.getName() : "Teacher",
                        plainPassword != null ? plainPassword : "(set by admin)");
            }

            // 2. Notification email → Institute / Admin
            String instituteName = "Admin";
            String instituteEmail = null;

            // Try to get logged-in institute info from JWT security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
                instituteName = userDetails.getName() != null ? userDetails.getName() : "Admin";
                instituteEmail = userDetails.getEmail();
            }

            emailService.sendInstituteNotification(
                    instituteName,
                    saved.getName() != null ? saved.getName() : "Unknown",
                    saved.getEmail() != null ? saved.getEmail() : "N/A",
                    saved.getMobile());

        } catch (Exception e) {
            // Email failure must never prevent teacher creation from succeeding
            System.err.println("⚠️ Email sending failed (non-critical): " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher updated) {
        return teacherRepository.findById(id).map(teacher -> {
            teacher.setName(updated.getName());
            teacher.setEmail(updated.getEmail());
            teacher.setMobile(
                    updated.getMobile() != null && updated.getMobile().isBlank() ? null : updated.getMobile());
            teacher.setGender(updated.getGender());
            teacher.setDob(updated.getDob());
            teacher.setQualification(updated.getQualification());
            teacher.setStatus(updated.getStatus());
            teacher.setDescription(updated.getDescription());
            teacher.setImageUrl(updated.getImageUrl());
            teacher.setMaxEnrolls(updated.getMaxEnrolls());
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
