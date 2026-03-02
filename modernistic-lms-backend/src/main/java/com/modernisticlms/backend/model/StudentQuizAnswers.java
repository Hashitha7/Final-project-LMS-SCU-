package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_quiz_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuizAnswers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "quiz_class_id")
    private QuizClass quizClass;

    @ManyToOne
    @JoinColumn(name = "quiz_course_id")
    private QuizCourse quizCourse;

    @ManyToOne
    @JoinColumn(name = "class_enroll_id")
    private ClassEnroll classEnroll;

    @ManyToOne
    @JoinColumn(name = "course_enroll_id")
    private CourseEnroll courseEnroll;

    private String answers;

    private int mark = 0;

    private int state = 0;

    private int isFinalMarkCalculated = 0;

    private String teacherComments;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;
}

