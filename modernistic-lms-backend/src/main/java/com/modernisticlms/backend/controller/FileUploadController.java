package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private S3Service s3Service;

    /**
     * Upload a file to S3.
     * POST /api/files/upload?folder=courses
     * Body: multipart/form-data with 'file' field
     * Returns: { "url": "https://..." }
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            // Validate file size (max 100MB)
            long maxSize = 100 * 1024 * 1024; // 100MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds 100MB limit"));
            }

            String url = s3Service.uploadFile(file, folder);
            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "fileName", file.getOriginalFilename(),
                    "size", file.getSize(),
                    "contentType", file.getContentType()));
        } catch (SdkClientException e) {
            return ResponseEntity.status(503).body(Map.of(
                    "message", "Upload failed: AWS credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, then restart backend."));
        } catch (S3Exception e) {
            return ResponseEntity.status(e.statusCode() > 0 ? e.statusCode() : 502).body(Map.of(
                    "message", "Upload failed: " + e.awsErrorDetails().errorMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Delete a file from S3.
     * DELETE /api/files/delete?url=https://...
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFile(@RequestParam("url") String fileUrl) {
        try {
            s3Service.deleteFile(fileUrl);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Delete failed: " + e.getMessage()));
        }
    }
}
