package com.modernisticlms.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.Comparator;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretAccessKey}")
    private String secretAccessKey;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        var builder = S3Client.builder().region(Region.of(region));

        boolean hasExplicitKeys = !isBlank(accessKeyId) && !isBlank(secretAccessKey);
        if (hasExplicitKeys) {
            if (isPlaceholder(accessKeyId) || isPlaceholder(secretAccessKey)) {
                throw new IllegalStateException(
                        "Invalid AWS S3 credentials configuration: placeholder values detected. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or remove placeholders.");
            }

            AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId.trim(), secretAccessKey.trim());
            builder.credentialsProvider(StaticCredentialsProvider.create(credentials));
        } else {
            // Fall back to AWS SDK default chain (env vars, shared config, IAM role, etc.)
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        this.s3Client = builder.build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean isPlaceholder(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase();
        return normalized.startsWith("YOUR_");
    }

    /**
     * Upload a file to S3 and return its public URL.
     *
     * @param file   the multipart file
     * @param folder folder name inside the bucket (e.g. "courses", "lessons")
     * @return the public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Generate a unique file name and preserve original name for easier traceability.
        String originalFilename = file.getOriginalFilename();
        String safeName = sanitizeFileName(originalFilename);
        String key = normalizeFolder(folder) + UUID.randomUUID() + "__" + safeName;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    public String resolveLatestFileUrl(String folder, String fileName) {
        String normalizedTarget = normalizeForSearch(fileName);
        if (normalizedTarget.isBlank()) {
            throw new IllegalArgumentException("fileName is required");
        }

        String prefix = normalizeFolder(folder);
        ListObjectsV2Request request = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(prefix)
                .build();

        ListObjectsV2Response response = s3Client.listObjectsV2(request);
        if (response.contents() == null || response.contents().isEmpty()) {
            throw new IllegalArgumentException("No files found in the requested folder");
        }

        S3Object match = response.contents().stream()
                .filter(Objects::nonNull)
                .filter(obj -> {
                    String key = obj.key();
                    if (key == null || key.isBlank()) {
                        return false;
                    }
                    String keyName = key.substring(key.lastIndexOf('/') + 1);
                    String normalizedKeyName = normalizeForSearch(keyName);
                    return normalizedKeyName.contains(normalizedTarget);
                })
                .max(Comparator.comparing(S3Object::lastModified))
                .orElseThrow(() -> new IllegalArgumentException("Matching file not found in S3"));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, match.key());
    }

    /**
     * Delete a file from S3 by its key.
     */
    public void deleteFile(String fileUrl) {
        // Extract key from URL: https://bucket.s3.region.amazonaws.com/KEY
        String prefix = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
        if (!fileUrl.startsWith(prefix))
            return;

        String key = fileUrl.substring(prefix.length());

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteRequest);
    }

    private String normalizeFolder(String folder) {
        String trimmed = (folder == null || folder.isBlank()) ? "general" : folder.trim();
        return trimmed.endsWith("/") ? trimmed : trimmed + "/";
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "file.bin";
        }

        String safe = fileName.trim().replaceAll("[^A-Za-z0-9._-]", "_");
        return safe.isBlank() ? "file.bin" : safe;
    }

    private String normalizeForSearch(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }
}
