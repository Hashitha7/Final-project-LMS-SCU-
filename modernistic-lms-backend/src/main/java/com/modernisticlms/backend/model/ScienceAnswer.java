package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "science_answer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScienceAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;

    private String teacherName;

    private String grade;

    private String subject;

    private String topic;

    private String fileName;

    private String fileType;

    @Column(length = 10000)
    private String extractedText;

    private Double score;

    private String gradeLabel;

    private Double similarityScore;

    private Double keywordCoverage;

    @Column(length = 5000)
    private String matchedKeywords;

    @Column(length = 5000)
    private String missedKeywords;

    private Integer totalKeywords;

    private Integer matchedCount;

    private Integer missedCount;

    @Column(length = 5000)
    private String feedback;

    private String questionTopic;

    private Integer wordCount;

    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}
