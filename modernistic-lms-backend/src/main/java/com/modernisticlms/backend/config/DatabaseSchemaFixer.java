package com.modernisticlms.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE student_quiz_answers MODIFY COLUMN answers LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE student_quiz_answers MODIFY COLUMN teacher_comments LONGTEXT");
            log.info("Applied schema fix: student_quiz_answers.answers and teacher_comments set to LONGTEXT");
        } catch (Exception ex) {
            // Do not block application startup for schema-fix attempt failures.
            log.warn("Schema fix skipped or failed: {}", ex.getMessage());
        }
    }
}
