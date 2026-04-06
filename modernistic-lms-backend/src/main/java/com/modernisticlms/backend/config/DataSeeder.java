package com.modernisticlms.backend.config;

import com.modernisticlms.backend.model.Institute;
import com.modernisticlms.backend.model.Teacher;
import com.modernisticlms.backend.model.Student;
import com.modernisticlms.backend.repository.InstituteRepository;
import com.modernisticlms.backend.repository.TeacherRepository;
import com.modernisticlms.backend.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            InstituteRepository instituteRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {

            // Seed default Institute (admin)
            if (!instituteRepository.existsByEmail("admin@modernisticlms.com")) {
                Institute institute = new Institute();
                institute.setName("Modernistic LMS Institute");
                institute.setEmail("admin@modernisticlms.com");
                institute.setUsername("admin");
                institute.setPassword(passwordEncoder.encode("demo123"));
                institute.setMobile("0771234567");
                institute.setStatus("active");
                institute.setInstituteRefId(1001);
                institute.setMaxStorage(10737418240L); // 10GB
                institute.setCurrentUsage(0L);
                instituteRepository.save(institute);
                System.out.println(" Seeded default Institute: admin@modernisticlms.com / demo123");
            } else {
                // Update password to ensure it's correct
                instituteRepository.findByEmail("admin@modernisticlms.com").ifPresent(inst -> {
                    inst.setPassword(passwordEncoder.encode("demo123"));
                    instituteRepository.save(inst);
                });
            }

            // Seed default Teacher
            if (!teacherRepository.existsByEmail("teacher@modernisticlms.com")) {
                Teacher teacher = new Teacher();
                teacher.setName("Demo Teacher");
                teacher.setEmail("teacher@modernisticlms.com");
                teacher.setMobile("0779876543");
                teacher.setPassword(passwordEncoder.encode("demo123"));
                teacher.setStatus("active");
                teacher.setQualification("B.Sc. in Education");
                teacher.setMaxEnrolls(100);
                teacherRepository.save(teacher);
                System.out.println(" Seeded default Teacher: teacher@modernisticlms.com / demo123");
            } else {
                teacherRepository.findByEmail("teacher@modernisticlms.com").ifPresent(t -> {
                    t.setPassword(passwordEncoder.encode("demo123"));
                    teacherRepository.save(t);
                });
            }

            // Seed default Student
            if (!studentRepository.existsByEmail("student@modernisticlms.com")) {
                Student student = new Student();
                student.setName("Demo Student");
                student.setEmail("student@modernisticlms.com");
                student.setMobile("0761234567");
                student.setPassword(passwordEncoder.encode("demo123"));
                student.setGrade("Grade 10");
                student.setSchool("Modernistic LMS School");
                student.setStatus("active");
                studentRepository.save(student);
                System.out.println(" Seeded default Student: student@modernisticlms.com / demo123");
            } else {
                studentRepository.findByEmail("student@modernisticlms.com").ifPresent(s -> {
                    s.setPassword(passwordEncoder.encode("demo123"));
                    studentRepository.save(s);
                });
            }
        };
    }
}
