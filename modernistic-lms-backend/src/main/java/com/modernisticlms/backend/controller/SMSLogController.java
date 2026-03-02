package com.modernisticlms.backend.controller;

import com.modernisticlms.backend.model.SMSLog;
import com.modernisticlms.backend.repository.SMSLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sms")
public class SMSLogController {

    @Autowired
    private SMSLogRepository smsLogRepository;

    @GetMapping
    public List<SMSLog> getAllSMS() {
        return smsLogRepository.findAll();
    }

    @PostMapping
    public SMSLog createSMS(@RequestBody SMSLog smsLog) {
        smsLog.setDateTime(LocalDateTime.now());
        return smsLogRepository.save(smsLog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSMS(@PathVariable Long id) {
        smsLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

