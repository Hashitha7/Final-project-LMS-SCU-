package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Teacher;
import com.modernisticlms.backend.model.Student;
import com.modernisticlms.backend.repository.InstituteRepository;
import com.modernisticlms.backend.repository.TeacherRepository;
import com.modernisticlms.backend.repository.StudentRepository;
import com.modernisticlms.backend.security.JwtUtils;
import com.modernisticlms.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    InstituteRepository instituteRepository;

    @Autowired
    TeacherRepository teacherRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * Login endpoint. Accepts { email, password, role } where role is "INSTITUTE",
     * "TEACHER", or "STUDENT".
     * If role is omitted, tries all three in order.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String role = loginRequest.getOrDefault("role", "").toUpperCase();

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        // Build username in format "email:ROLE" for UserDetailsService
        String usernameForAuth = role.isEmpty() ? email : email + ":" + role;

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usernameForAuth, password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            response.put("id", userDetails.getId());
            response.put("name", userDetails.getName());
            response.put("email", userDetails.getEmail());
            response.put("role", userDetails.getRole().toLowerCase());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    /**
     * Register a new student.
     */
    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        String password = req.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }
        if (studentRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        try {
            Student student = new Student();
            student.setName(req.getOrDefault("name", ""));
            student.setEmail(email);
            // Use null for mobile if blank to avoid unique constraint issues
            String mobile = req.get("mobile");
            student.setMobile((mobile != null && !mobile.isBlank()) ? mobile : null);
            student.setPassword(encoder.encode(password));
            student.setGrade(req.getOrDefault("grade", ""));
            student.setStatus("active");
            studentRepository.save(student);
            return ResponseEntity.ok(Map.of("message", "Student registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Register a new teacher.
     */
    @PostMapping("/register/teacher")
    public ResponseEntity<?> registerTeacher(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (teacherRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        Teacher teacher = new Teacher();
        teacher.setName(req.get("name"));
        teacher.setEmail(email);
        teacher.setMobile(req.get("mobile"));
        teacher.setPassword(encoder.encode(req.get("password")));
        teacher.setStatus("active");
        teacherRepository.save(teacher);

        return ResponseEntity.ok(Map.of("message", "Teacher registered successfully"));
    }

    /**
     * Get current logged-in user info.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("name", userDetails.getName());
        response.put("email", userDetails.getEmail());
        response.put("role", userDetails.getRole().toLowerCase());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Email required"));

        boolean found = instituteRepository.findByEmail(email).isPresent()
                || teacherRepository.findByEmail(email).isPresent()
                || studentRepository.findByEmail(email).isPresent();

        if (!found)
            return ResponseEntity.badRequest().body(Map.of("message", "No user found with that email"));

        return ResponseEntity.ok(Map.of("message", "Password reset instructions sent"));
    }
}

