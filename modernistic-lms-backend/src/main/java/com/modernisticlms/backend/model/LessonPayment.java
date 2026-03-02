package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    private String status;

    private String type;

    private String depositImage;

    @Column(unique = true)
    private String gatewayReference;

    @Column(unique = true)
    private String merchantrid;

    private LocalDateTime created;

    private LocalDateTime updated;

    private LocalDateTime approvedTimestamp;

    @ManyToOne
    @JoinColumn(name = "lesson_enroll_id")
    private LessonEnroll lessonEnroll;
}

