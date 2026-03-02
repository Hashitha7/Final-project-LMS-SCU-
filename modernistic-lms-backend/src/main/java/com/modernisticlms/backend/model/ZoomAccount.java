package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "zoom_account")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZoomAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @Column(unique = true)
    private String zoomUserId;

    private String status;

    private Long maxParticipantCount;

    private LocalDateTime createdTimestamp;

    private LocalDateTime allocatedTimestamp;

    private LocalDateTime lastAcquiredTimestamp;

    private LocalDateTime releasedTimestamp;

    @ManyToOne
    @JoinColumn(name = "current_teacher_id")
    private InstituteTeacher currentTeacher;

    @ManyToOne
    @JoinColumn(name = "institute_id", nullable = false)
    private Institute institute;
}

