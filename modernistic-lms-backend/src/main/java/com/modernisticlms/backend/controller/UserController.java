package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Institute;
import com.modernisticlms.backend.repository.InstituteRepository;
import com.modernisticlms.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private InstituteRepository instituteRepository;

    /**
     * Returns the currently authenticated user's profile.
     * Works for all user types (Institute/Teacher/Student).
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

    @GetMapping("/institutes")
    public List<Institute> getAllInstitutes() {
        return instituteRepository.findAll();
    }

    @GetMapping("/institutes/{id}")
    public ResponseEntity<Institute> getInstituteById(@PathVariable Long id) {
        return instituteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/institutes/{id}")
    public ResponseEntity<Institute> updateInstitute(@PathVariable Long id, @RequestBody Institute updated) {
        return instituteRepository.findById(id).map(inst -> {
            inst.setName(updated.getName());
            inst.setEmail(updated.getEmail());
            inst.setMobile(updated.getMobile());
            inst.setDescription(updated.getDescription());
            inst.setImageUrl(updated.getImageUrl());
            inst.setStatus(updated.getStatus());
            inst.setNoticeHeader(updated.getNoticeHeader());
            inst.setNoticeMsg(updated.getNoticeMsg());
            return ResponseEntity.ok(instituteRepository.save(inst));
        }).orElse(ResponseEntity.notFound().build());
    }
}

