package com.modernisticlms.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "zoom")
public class ZoomProperties {
    private boolean enabled = false;
    private String accountId;
    private String clientId;
    private String clientSecret;
    private String userId;
    private String tokenUrl = "https://zoom.us/oauth/token";
    private String apiBaseUrl = "https://api.zoom.us/v2";

    public boolean isConfigured() {
        return hasText(accountId) && hasText(clientId) && hasText(clientSecret) && hasText(userId);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
