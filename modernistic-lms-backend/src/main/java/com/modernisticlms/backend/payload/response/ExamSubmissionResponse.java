package com.modernisticlms.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmissionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long examId;
    private String examTitle;
    private String answers;
    private int mark;
    private int state;
    private int isFinalMarkCalculated;
    private String teacherComments;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
