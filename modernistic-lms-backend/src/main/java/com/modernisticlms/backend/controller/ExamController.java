package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Quiz;
import com.modernisticlms.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public Quiz createExam(@RequestBody Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @PutMapping("/{id}")
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
            return ResponseEntity.ok(quizRepository.save(quiz));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

