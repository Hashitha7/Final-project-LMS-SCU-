package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "quiz")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 500)
    private String description;

    private String quizType;

    private int noOfQuestions = 0;

    private int noOfAnswersPerQuestion = 0;

    private double paperDuration = 0;

    private double price;

    private String questionPaperUrl;

    private String answers;

    private int state = 0;

    private int sell = 0;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
}

