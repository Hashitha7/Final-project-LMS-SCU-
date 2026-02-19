package com.eduspark.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_enroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassEnroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String status;

    private String type;

    private String enrollType;

    private String month;

    private int year;

    private LocalDateTime dateTime;
}
