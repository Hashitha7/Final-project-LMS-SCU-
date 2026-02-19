package com.eduspark.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoursePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    private String status;

    private String paymentType;

    private String depositType;

    private String slipImageUrl;

    @Column(unique = true)
    private String gatewayReference;

    @Column(unique = true)
    private String merchantrid;

    private LocalDateTime created;

    private LocalDateTime updated;

    private LocalDateTime approvedDateTime;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "course_enroll_id")
    private CourseEnroll courseEnroll;

    @ManyToOne
    @JoinColumn(name = "course_installment_id")
    private CourseInstallment courseInstallment;
}
