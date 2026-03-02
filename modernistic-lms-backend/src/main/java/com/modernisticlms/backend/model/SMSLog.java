package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SMSLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mobile;

    private String message;

    private String smsBody;

    private String status;

    private String typeOfSms;

    private int code;

    private LocalDateTime dateTime;

    @ManyToOne
    @JoinColumn(name = "institute_id", nullable = false)
    private Institute institute;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}

