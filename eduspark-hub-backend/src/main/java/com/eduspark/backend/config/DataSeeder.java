package com.eduspark.backend.config;

import com.eduspark.backend.model.Institute;
import com.eduspark.backend.model.Teacher;
import com.eduspark.backend.model.Student;
import com.eduspark.backend.repository.InstituteRepository;
import com.eduspark.backend.repository.TeacherRepository;
import com.eduspark.backend.repository.StudentRepository;
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
            if (!instituteRepository.existsByEmail("admin@eduspark.com")) {
                Institute institute = new Institute();
                institute.setName("EduSpark Institute");
                institute.setEmail("admin@eduspark.com");
                institute.setUsername("admin");
                institute.setPassword(passwordEncoder.encode("demo123"));
                institute.setMobile("0771234567");
                institute.setStatus("active");
                institute.setInstituteRefId(1001);
                institute.setMaxStorage(10737418240L); // 10GB
                institute.setCurrentUsage(0L);
                instituteRepository.save(institute);
                System.out.println("✅ Seeded default Institute: admin@eduspark.com / demo123");
            } else {
                // Update password to ensure it's correct
                instituteRepository.findByEmail("admin@eduspark.com").ifPresent(inst -> {
                    inst.setPassword(passwordEncoder.encode("demo123"));
                    instituteRepository.save(inst);
                });
            }

            // Seed default Teacher
            if (!teacherRepository.existsByEmail("teacher@eduspark.com")) {
                Teacher teacher = new Teacher();
                teacher.setName("Demo Teacher");
                teacher.setEmail("teacher@eduspark.com");
                teacher.setMobile("0779876543");
                teacher.setPassword(passwordEncoder.encode("demo123"));
                teacher.setStatus("active");
                teacher.setQualification("B.Sc. in Education");
                teacher.setMaxEnrolls(100);
                teacherRepository.save(teacher);
                System.out.println("✅ Seeded default Teacher: teacher@eduspark.com / demo123");
            } else {
                teacherRepository.findByEmail("teacher@eduspark.com").ifPresent(t -> {
                    t.setPassword(passwordEncoder.encode("demo123"));
                    teacherRepository.save(t);
                });
            }

            // Seed default Student
            if (!studentRepository.existsByEmail("student@eduspark.com")) {
                Student student = new Student();
                student.setName("Demo Student");
                student.setEmail("student@eduspark.com");
                student.setMobile("0761234567");
                student.setPassword(passwordEncoder.encode("demo123"));
                student.setGrade("Grade 10");
                student.setSchool("EduSpark School");
                student.setStatus("active");
                studentRepository.save(student);
                System.out.println("✅ Seeded default Student: student@eduspark.com / demo123");
            } else {
                studentRepository.findByEmail("student@eduspark.com").ifPresent(s -> {
                    s.setPassword(passwordEncoder.encode("demo123"));
                    studentRepository.save(s);
                });
            }
        };
    }
}
