package com.eduspark.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "course_installment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int installmentNo;

    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
