package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "class")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String subject;

    private String grade;

    @Column(length = 5000)
    private String description;

    @Column(length = 5000)
    private String syllabus;

    private BigDecimal fee;

    private boolean firstWeekFree = false;

    private String imageUrl;

    private String videoUrl;

    private long videoSize = 0;

    @Column(length = 15)
    private String classOnGoingStatus = "NOT_STARTED";

    private int activeStatus = 1;

    private String uniqueHashCode;

    private LocalDateTime lastMeetingStartedAt;

    @Column(length = 5000)
    private String zoomStartUrl;

    @Column(length = 5000)
    private String zoomJoinUrl;

    private String zoomMeetingId;

    private String zoomMeetingPassword;

    @ManyToOne
    @JoinColumn(name = "institute_teacher_id")
    private InstituteTeacher instituteTeacher;

    @OneToMany(mappedBy = "schoolClass", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClassDayTime> dayTimes;
}
