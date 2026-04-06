package com.modernisticlms.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.modernisticlms.backend.model.Quiz;
import com.modernisticlms.backend.model.Student;
import com.modernisticlms.backend.model.StudentQuizAnswers;
import com.modernisticlms.backend.payload.request.ExamSubmissionRequest;
import com.modernisticlms.backend.payload.request.ExamSubmissionReviewRequest;
import com.modernisticlms.backend.payload.response.ExamSubmissionResponse;
import com.modernisticlms.backend.repository.QuizRepository;
import com.modernisticlms.backend.repository.StudentQuizAnswersRepository;
import com.modernisticlms.backend.repository.StudentRepository;
import com.modernisticlms.backend.repository.TeacherRepository;
import com.modernisticlms.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exam-submissions")
public class ExamSubmissionController {

    @Autowired
    private StudentQuizAnswersRepository submissionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ExamSubmissionResponse> submitExam(
            @RequestBody ExamSubmissionRequest request,
            Authentication authentication) {
        UserDetailsImpl user = getCurrentUser(authentication);

        if (request.getExamId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "examId is required");
        }

        Long studentId = user.getId();
        // Always trust authenticated identity over client payload.
        // This prevents false AccessDenied on retake when stale client data sends a mismatched studentId.

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Quiz quiz = quizRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        StudentQuizAnswers submission = new StudentQuizAnswers();
        submission.setStudent(student);
        submission.setQuiz(quiz);
        submission.setAnswers(serializeAnswers(request.getAnswers()));
        submission.setMark(0);
        submission.setState(1);
        submission.setIsFinalMarkCalculated(0);
        submission.setTeacherComments(null);
        submission.setStartDateTime(request.getStartDateTime() != null ? request.getStartDateTime() : LocalDateTime.now());
        submission.setEndDateTime(request.getEndDateTime() != null ? request.getEndDateTime() : LocalDateTime.now());

        StudentQuizAnswers saved = submissionRepository.save(submission);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT','TEACHER','INSTITUTE')")
    public List<ExamSubmissionResponse> getSubmissions(Authentication authentication) {
        UserDetailsImpl user = getCurrentUser(authentication);
        List<StudentQuizAnswers> data;

        switch (user.getRole()) {
            case "STUDENT" -> data = submissionRepository.findByStudentIdOrderByEndDateTimeDesc(user.getId());
            case "TEACHER" -> data = submissionRepository.findByQuizTeacherIdOrderByEndDateTimeDesc(user.getId());
            default -> data = submissionRepository.findAll();
        }

        return data.stream().map(this::toResponse).toList();
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyAuthority('TEACHER','INSTITUTE')")
    public List<ExamSubmissionResponse> getSubmissionsByExam(
            @PathVariable Long examId,
            Authentication authentication) {
        UserDetailsImpl user = getCurrentUser(authentication);

        Quiz quiz = quizRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        if ("TEACHER".equals(user.getRole())) {
            ensureTeacherOwnsExam(user.getId(), quiz);
        }

        return submissionRepository.findByQuizIdOrderByEndDateTimeDesc(examId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('TEACHER','INSTITUTE')")
    public ResponseEntity<ExamSubmissionResponse> reviewSubmission(
            @PathVariable Long id,
            @RequestBody ExamSubmissionReviewRequest request,
            Authentication authentication) {
        UserDetailsImpl user = getCurrentUser(authentication);

        StudentQuizAnswers submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        if ("TEACHER".equals(user.getRole())) {
            if (submission.getQuiz() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission has no related exam");
            }
            ensureTeacherOwnsExam(user.getId(), submission.getQuiz());
        }

        if (request.getMark() != null) {
            submission.setMark(Math.max(0, request.getMark()));
        }
        if (request.getTeacherComments() != null) {
            submission.setTeacherComments(request.getTeacherComments());
        }

        submission.setState(request.getState() != null ? request.getState() : 2);
        submission.setIsFinalMarkCalculated(
                request.getIsFinalMarkCalculated() != null ? request.getIsFinalMarkCalculated() : 1
        );

        StudentQuizAnswers saved = submissionRepository.save(submission);
        return ResponseEntity.ok(toResponse(saved));
    }

    private UserDetailsImpl getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return user;
    }

    private void ensureTeacherOwnsExam(Long teacherId, Quiz quiz) {
        if (quiz.getTeacher() == null || quiz.getTeacher().getId() == null) {
            throw new AccessDeniedException("Exam is not owned by any teacher");
        }
        if (!quiz.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You cannot review submissions for another teacher's exam");
        }

        teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));
    }

    private String serializeAnswers(Object answers) {
        if (answers == null) {
            return "{}";
        }
        if (answers instanceof String s) {
            return s;
        }
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid answers payload");
        }
    }

    private ExamSubmissionResponse toResponse(StudentQuizAnswers item) {
        return ExamSubmissionResponse.builder()
                .id(item.getId())
                .studentId(item.getStudent() != null ? item.getStudent().getId() : null)
                .studentName(item.getStudent() != null ? item.getStudent().getName() : null)
                .studentEmail(item.getStudent() != null ? item.getStudent().getEmail() : null)
                .examId(item.getQuiz() != null ? item.getQuiz().getId() : null)
                .examTitle(item.getQuiz() != null ? item.getQuiz().getTitle() : null)
                .answers(item.getAnswers())
                .mark(item.getMark())
                .state(item.getState())
                .isFinalMarkCalculated(item.getIsFinalMarkCalculated())
                .teacherComments(item.getTeacherComments())
                .startDateTime(item.getStartDateTime())
                .endDateTime(item.getEndDateTime())
                .build();
    }
}
