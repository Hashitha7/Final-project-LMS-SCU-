package com.eduspark.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String imageUrl;

    private String videoUrl;

    private long videoSize = 0;

    private BigDecimal totalFee;

    private int noOfInstallments = 0;

    private int noOfSemesters = 0;

    private String status;

    @Column(length = 15, columnDefinition = "varchar(15) default 'NOT_STARTED'")
    private String courseOnGoingStatus = "NOT_STARTED";

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDateTime created;

    private LocalDateTime updated;

    private LocalDateTime lastMeetingStartedAt;

    private Long currentTeacherId;

    @Column(columnDefinition = "LONGTEXT")
    private String zoomStartUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String zoomJoinUrl;

    private String zoomMeetingId;

    private String zoomMeetingPassword;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseDayTime> dayTimes;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseInstallment> installments;
}
