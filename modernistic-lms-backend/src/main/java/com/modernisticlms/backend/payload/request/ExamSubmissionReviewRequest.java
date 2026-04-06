package com.modernisticlms.backend.payload.request;

import lombok.Data;

@Data
public class ExamSubmissionReviewRequest {
    private Integer mark;
    private Integer state;
    private Integer isFinalMarkCalculated;
    private String teacherComments;
}
