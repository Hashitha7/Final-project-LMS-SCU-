package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "lesson")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    private BigDecimal fee;

    private String image;

    private String previewVideo;

    private long previewVideoSize = 0;

    private int validityDays = 0;

    private int activeStatus = 1;

    private Long courseId;
    
    private Integer lessonOrder;

    @Column(columnDefinition = "LONGTEXT")
    private String resourcesJson;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "password" })
    private Teacher teacher;
}
