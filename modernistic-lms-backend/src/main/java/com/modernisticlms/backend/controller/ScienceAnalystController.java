package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.ScienceAnswer;
import com.modernisticlms.backend.repository.ScienceAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/science-analyst")
public class ScienceAnalystController {

    private static final String FLASK_URL = "http://localhost:5000";

    @Autowired
    private ScienceAnswerRepository scienceAnswerRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Upload a student answer file (PDF/PNG) and analyze it.
     * Proxies the request to the Python Flask service.
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeAnswer(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "question_id", required = false) String questionId,
            @RequestParam(value = "student_name", required = false, defaultValue = "Unknown Student") String studentName,
            @RequestParam(value = "teacher_name", required = false, defaultValue = "Unknown Teacher") String teacherName) {
        try {
            // Build multipart request for Flask
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Add file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);

            // Add optional params
            if (grade != null)
                body.add("grade", grade);
            if (subject != null)
                body.add("subject", subject);
            if (topic != null)
                body.add("topic", topic);
            if (questionId != null)
                body.add("question_id", questionId);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Call Flask service
            ResponseEntity<Map> response = restTemplate.exchange(
                    FLASK_URL + "/api/upload-and-analyze",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);

            Map<String, Object> result = response.getBody();

            // Save result to database
            if (result != null && Boolean.TRUE.equals(result.get("success"))) {
                ScienceAnswer answer = new ScienceAnswer();
                answer.setStudentName(studentName);
                answer.setTeacherName(teacherName);
                answer.setGrade(grade);
                answer.setSubject(subject);
                answer.setTopic(topic);
                answer.setFileName(file.getOriginalFilename());
                answer.setFileType(file.getContentType());
                answer.setExtractedText((String) result.get("student_answer_preview"));
                answer.setScore(toDouble(result.get("score")));
                answer.setGradeLabel((String) result.get("grade"));
                answer.setSimilarityScore(toDouble(result.get("similarity_score")));
                answer.setKeywordCoverage(toDouble(result.get("keyword_coverage")));
                answer.setMatchedKeywords(listToString(result.get("matched_keywords")));
                answer.setMissedKeywords(listToString(result.get("missed_keywords")));
                answer.setTotalKeywords(toInt(result.get("total_keywords")));
                answer.setMatchedCount(toInt(result.get("matched_count")));
                answer.setMissedCount(toInt(result.get("missed_count")));
                answer.setFeedback((String) result.get("feedback"));
                answer.setQuestionTopic((String) result.get("question_topic"));
                answer.setWordCount(toInt(result.get("word_count")));

                ScienceAnswer saved = scienceAnswerRepository.save(answer);
                result.put("db_id", saved.getId());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "success", false,
                    "error",
                    "Python analysis service is not available. Make sure Flask is running on port 5000. Error: "
                            + e.getMessage()));
        }
    }

    /**
     * Get all analysis results
     */
    @GetMapping("/results")
    public List<ScienceAnswer> getAllResults() {
        return scienceAnswerRepository.findAll();
    }

    /**
     * Get a single result by ID
     */
    @GetMapping("/results/{id}")
    public ResponseEntity<ScienceAnswer> getResultById(@PathVariable Long id) {
        return scienceAnswerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get results filtered by grade
     */
    @GetMapping("/results/grade/{grade}")
    public List<ScienceAnswer> getResultsByGrade(@PathVariable String grade) {
        return scienceAnswerRepository.findByGrade(grade);
    }

    /**
     * Get available topics from Flask service
     */
    @GetMapping("/topics")
    public ResponseEntity<?> getTopics(
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "subject", required = false) String subject) {
        try {
            String url = FLASK_URL + "/api/topics";
            if (grade != null || subject != null) {
                url += "?";
                if (grade != null)
                    url += "grade=" + grade + "&";
                if (subject != null)
                    url += "subject=" + subject;
            }

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "success", false,
                    "error", "Python service not available: " + e.getMessage()));
        }
    }

    /**
     * Health check — checks both Spring Boot and Flask
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        boolean flaskHealthy = false;
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(FLASK_URL + "/api/health", Map.class);
            flaskHealthy = response.getStatusCode().is2xxSuccessful();
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of(
                "springBoot", "healthy",
                "flaskService", flaskHealthy ? "healthy" : "unavailable",
                "message", flaskHealthy
                        ? "All services running"
                        : "Flask service not available. Run: python app.py in science-answer-analyst-system/"));
    }

    /**
     * Delete a result
     */
    @DeleteMapping("/results/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        scienceAnswerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update the student assigned to a result
     */
    @PutMapping("/results/{id}/student")
    public ResponseEntity<?> updateResultStudent(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return scienceAnswerRepository.findById(id).map(answer -> {
            answer.setStudentName(payload.get("studentName"));
            scienceAnswerRepository.save(answer);
            return ResponseEntity.ok(Map.of("success", true, "studentName", answer.getStudentName()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Helper methods ───────────────────────────────────
    private Double toDouble(Object obj) {
        if (obj == null)
            return 0.0;
        if (obj instanceof Number)
            return ((Number) obj).doubleValue();
        try {
            return Double.parseDouble(obj.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private Integer toInt(Object obj) {
        if (obj == null)
            return 0;
        if (obj instanceof Number)
            return ((Number) obj).intValue();
        try {
            return Integer.parseInt(obj.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    @SuppressWarnings("unchecked")
    private String listToString(Object obj) {
        if (obj == null)
            return "";
        if (obj instanceof List)
            return String.join(", ", (List<String>) obj);
        return obj.toString();
    }
}
