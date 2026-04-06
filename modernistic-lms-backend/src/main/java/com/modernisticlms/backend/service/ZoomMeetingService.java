package com.modernisticlms.backend.service;

import com.modernisticlms.backend.config.ZoomProperties;
import com.modernisticlms.backend.model.Course;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ZoomMeetingService {

    private final ZoomProperties zoomProperties;
    private final RestTemplate restTemplate;

    public ZoomMeetingService(ZoomProperties zoomProperties) {
        this.zoomProperties = zoomProperties;
        this.restTemplate = new RestTemplate();
    }

    public ZoomMeetingResult createMeetingForCourse(Course course) {
        if (!zoomProperties.isEnabled()) {
            throw new IllegalStateException("Zoom auto-create is disabled. Set zoom.enabled=true.");
        }
        if (!zoomProperties.isConfigured()) {
            throw new IllegalStateException("Zoom configuration is incomplete. Please set zoom.account-id, zoom.client-id, zoom.client-secret and zoom.user-id.");
        }

        String accessToken = fetchAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("topic", course.getName());
        payload.put("type", 2);
        payload.put("start_time", LocalDateTime.now().plusMinutes(5).atOffset(ZoneOffset.UTC)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        payload.put("duration", 120);
        payload.put("timezone", "Asia/Colombo");

        String generatedPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        payload.put("password", generatedPassword);

        Map<String, Object> settings = new HashMap<>();
        settings.put("join_before_host", false);
        settings.put("waiting_room", true);
        settings.put("host_video", true);
        settings.put("participant_video", true);
        payload.put("settings", settings);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        String meetingUrl = zoomProperties.getApiBaseUrl() + "/users/" + zoomProperties.getUserId() + "/meetings";

        ResponseEntity<Map> response = restTemplate.exchange(meetingUrl, HttpMethod.POST, requestEntity, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null) {
            throw new IllegalStateException("Zoom API returned an empty meeting response.");
        }

        Object idObject = body.get("id");
        String meetingId = idObject != null ? String.valueOf(idObject) : null;
        String startUrl = (String) body.get("start_url");
        String joinUrl = (String) body.get("join_url");
        String password = (String) body.get("password");

        if (meetingId == null || startUrl == null || joinUrl == null) {
            throw new IllegalStateException("Zoom API response is missing required meeting fields.");
        }

        return new ZoomMeetingResult(meetingId, startUrl, joinUrl, password, LocalDateTime.now());
    }

    private String fetchAccessToken() {
        String credentials = zoomProperties.getClientId() + ":" + zoomProperties.getClientSecret();
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedCredentials);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String tokenUrl = zoomProperties.getTokenUrl()
                + "?grant_type=account_credentials&account_id="
                + zoomProperties.getAccountId();

        HttpEntity<String> requestEntity = new HttpEntity<>("", headers);
        ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, requestEntity, Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("Failed to retrieve Zoom access token.");
        }
        return (String) body.get("access_token");
    }

    public record ZoomMeetingResult(String meetingId, String startUrl, String joinUrl, String password,
                                    LocalDateTime startedAt) {
    }
}
