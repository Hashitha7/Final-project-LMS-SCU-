package com.modernisticlms.backend.payload.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExamSubmissionRequest {
    private Long examId;
    private Long studentId;
    private Object answers;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
