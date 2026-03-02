package com.modernisticlms.backend.repository;

import com.modernisticlms.backend.model.SMSLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SMSLogRepository extends JpaRepository<SMSLog, Long> {
    List<SMSLog> findByInstituteId(Long instituteId);

    List<SMSLog> findByTeacherId(Long teacherId);
}

