package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_course")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;
}

