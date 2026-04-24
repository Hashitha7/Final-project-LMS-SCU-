package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Quiz;
import com.modernisticlms.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping
    public List<Quiz> getAllExams() {
        return quizRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getExamById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.modernisticlms.backend.repository.TeacherRepository teacherRepository;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public Quiz createExam(@RequestBody Quiz quiz) {
        if (quiz.getTeacher() != null && quiz.getTeacher().getId() != null) {
            com.modernisticlms.backend.model.Teacher teacher = teacherRepository.findById(quiz.getTeacher().getId())
                              .orElseThrow(() -> new RuntimeException("Teacher not found"));
            quiz.setTeacher(teacher);
        }
        return quizRepository.save(quiz);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<Quiz> updateExam(@PathVariable Long id, @RequestBody Quiz updated) {
        return quizRepository.findById(id).map(quiz -> {
            quiz.setTitle(updated.getTitle());
            quiz.setDescription(updated.getDescription());
            quiz.setQuizType(updated.getQuizType());
            quiz.setNoOfQuestions(updated.getNoOfQuestions());
            quiz.setNoOfAnswersPerQuestion(updated.getNoOfAnswersPerQuestion());
            quiz.setPaperDuration(updated.getPaperDuration());
            quiz.setPrice(updated.getPrice());
            quiz.setQuestionPaperUrl(updated.getQuestionPaperUrl());
            quiz.setState(updated.getState());
            quiz.setSell(updated.getSell());
            quiz.setCourseId(updated.getCourseId());
            quiz.setClassId(updated.getClassId());
            quiz.setDate(updated.getDate());
            quiz.setStatus(updated.getStatus());
            return ResponseEntity.ok(quizRepository.save(quiz));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.modernisticlms.backend.repository.StudentQuizAnswersRepository studentQuizAnswersRepository;

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        studentQuizAnswersRepository.deleteAll(studentQuizAnswersRepository.findByQuizIdOrderByEndDateTimeDesc(id));
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

