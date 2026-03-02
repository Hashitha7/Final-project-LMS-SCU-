package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deposit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    private String depositType;

    private String imageUrl;

    private LocalDateTime dateTime;

    @OneToOne
    @JoinColumn(name = "class_enroll_id", unique = true)
    private ClassEnroll classEnroll;
}

