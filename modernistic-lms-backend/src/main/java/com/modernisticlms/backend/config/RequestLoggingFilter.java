package com.modernisticlms.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RequestLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        long startTime = System.currentTimeMillis();

        // Log request
        logger.info("Incoming Request: {} {} from {}",
                httpRequest.getMethod(),
                httpRequest.getRequestURI(),
                httpRequest.getRemoteAddr());

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            // Log response
            logger.info("Outgoing Response: {} {} - Status: {} - Duration: {}ms",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    duration);
        }
    }
}

