package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_enroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonEnroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_enroll_id")
    private ClassEnroll classEnroll;

    @ManyToOne
    @JoinColumn(name = "course_enroll_id")
    private CourseEnroll courseEnroll;

    private String status;

    private String type;

    private int activeStatus = 1;

    private LocalDateTime enrollDateTime;

    private LocalDateTime expireDateTime;

    private LocalDateTime created;

    private LocalDateTime updated;
}

