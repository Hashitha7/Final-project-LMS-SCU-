package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_class")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private int enrollMonth;

    private int enrollYear;
}

