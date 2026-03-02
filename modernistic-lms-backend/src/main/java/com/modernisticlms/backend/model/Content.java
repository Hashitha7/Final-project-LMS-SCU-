package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "content")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private String type;

    private String url;

    private double duration = 0;

    private long contentSize = 0;

    private int viewCount = 0;

    private int deleteStatus = 0;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;
}

