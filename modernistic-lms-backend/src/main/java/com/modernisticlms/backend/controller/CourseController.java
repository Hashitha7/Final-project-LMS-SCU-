package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.Course;
import com.modernisticlms.backend.repository.CourseRepository;
import com.modernisticlms.backend.security.UserDetailsImpl;
import com.modernisticlms.backend.service.ZoomMeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ZoomMeetingService zoomMeetingService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public Course createCourse(@RequestBody Course course) {
        course.setCreated(LocalDateTime.now());
        course.setUpdated(LocalDateTime.now());
        return courseRepository.save(course);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course updated) {
        return courseRepository.findById(id).map(course -> {
            course.setName(updated.getName());
            course.setDescription(updated.getDescription());
            course.setImageUrl(updated.getImageUrl());
            course.setVideoUrl(updated.getVideoUrl());
            course.setVideoSize(updated.getVideoSize());
            course.setTotalFee(updated.getTotalFee());
            course.setNoOfInstallments(updated.getNoOfInstallments());
            course.setNoOfSemesters(updated.getNoOfSemesters());
            course.setStatus(updated.getStatus());
            course.setStartDate(updated.getStartDate());
            course.setEndDate(updated.getEndDate());
            course.setCurrentTeacherId(updated.getCurrentTeacherId());
            course.setZoomStartUrl(updated.getZoomStartUrl());
            course.setZoomJoinUrl(updated.getZoomJoinUrl());
            course.setZoomMeetingId(updated.getZoomMeetingId());
            course.setZoomMeetingPassword(updated.getZoomMeetingPassword());
            course.setLastMeetingStartedAt(updated.getLastMeetingStartedAt());
            course.setUpdated(LocalDateTime.now());
            return ResponseEntity.ok(courseRepository.save(course));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/zoom/auto-create")
    @PreAuthorize("hasAnyAuthority('INSTITUTE','TEACHER')")
    public ResponseEntity<?> autoCreateZoomMeeting(@PathVariable Long id, Authentication authentication) {
        return courseRepository.findById(id).map(course -> {
            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            boolean isTeacher = "TEACHER".equalsIgnoreCase(user.getRole());
            if (isTeacher && course.getCurrentTeacherId() != null
                    && !course.getCurrentTeacherId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only start meetings for your own courses."));
            }

            try {
                if (course.getZoomMeetingId() == null || course.getZoomMeetingId().isBlank()
                        || course.getZoomStartUrl() == null || course.getZoomStartUrl().isBlank()
                        || course.getZoomJoinUrl() == null || course.getZoomJoinUrl().isBlank()) {
                    ZoomMeetingService.ZoomMeetingResult result = zoomMeetingService.createMeetingForCourse(course);
                    course.setZoomMeetingId(result.meetingId());
                    course.setZoomStartUrl(result.startUrl());
                    course.setZoomJoinUrl(result.joinUrl());
                    course.setZoomMeetingPassword(result.password());
                    course.setLastMeetingStartedAt(result.startedAt());
                } else {
                    course.setLastMeetingStartedAt(LocalDateTime.now());
                }

                course.setUpdated(LocalDateTime.now());
                return ResponseEntity.ok(courseRepository.save(course));
            } catch (IllegalStateException ex) {
                return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
            } catch (RestClientException ex) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("message", "Failed to create Zoom meeting. Please verify Zoom credentials and host user settings."));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
