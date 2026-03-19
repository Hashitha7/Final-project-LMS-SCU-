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
                throw new IllegalStateException("Invalid AWS S3 credentials configuration: placeholder values detected. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or remove placeholders.");
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
        // Generate a unique file name to avoid collisions
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String key = folder + "/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
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
}
