package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.SchoolClass;
import com.modernisticlms.backend.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class SchoolClassController {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @GetMapping
    public List<SchoolClass> getAllClasses() {
        return schoolClassRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolClass> getClassById(@PathVariable Long id) {
        return schoolClassRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SchoolClass createClass(@RequestBody SchoolClass schoolClass) {
        return schoolClassRepository.save(schoolClass);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolClass> updateClass(@PathVariable Long id, @RequestBody SchoolClass updated) {
        return schoolClassRepository.findById(id).map(sc -> {
            sc.setName(updated.getName());
            sc.setSubject(updated.getSubject());
            sc.setGrade(updated.getGrade());
            sc.setDescription(updated.getDescription());
            sc.setSyllabus(updated.getSyllabus());
            sc.setFee(updated.getFee());
            sc.setFirstWeekFree(updated.isFirstWeekFree());
            sc.setImageUrl(updated.getImageUrl());
            sc.setActiveStatus(updated.getActiveStatus());
            sc.setInstituteTeacher(updated.getInstituteTeacher());
            return ResponseEntity.ok(schoolClassRepository.save(sc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        schoolClassRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

