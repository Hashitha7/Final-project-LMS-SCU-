package com.eduspark.backend.security;

import com.eduspark.backend.model.Institute;
import com.eduspark.backend.model.Teacher;
import com.eduspark.backend.model.Student;
import com.eduspark.backend.repository.InstituteRepository;
import com.eduspark.backend.repository.TeacherRepository;
import com.eduspark.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads user by email from Institute, Teacher, or Student tables.
 * Format: "email:role" where role is INSTITUTE, TEACHER, or STUDENT.
 * If no role prefix, tries Institute first, then Teacher, then Student.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // username format: "email:ROLE" or just "email"
        String email;
        String role;

        if (username.contains(":")) {
            String[] parts = username.split(":", 2);
            email = parts[0];
            role = parts[1].toUpperCase();
        } else {
            email = username;
            role = null;
        }

        if (role == null || role.equals("INSTITUTE")) {
            java.util.Optional<Institute> institute = instituteRepository.findByEmail(email);
            if (institute.isPresent())
                return UserDetailsImpl.buildFromInstitute(institute.get());
        }

        if (role == null || role.equals("TEACHER")) {
            java.util.Optional<Teacher> teacher = teacherRepository.findByEmail(email);
            if (teacher.isPresent())
                return UserDetailsImpl.buildFromTeacher(teacher.get());
        }

        if (role == null || role.equals("STUDENT")) {
            java.util.Optional<Student> student = studentRepository.findByEmail(email);
            if (student.isPresent())
                return UserDetailsImpl.buildFromStudent(student.get());
        }

        throw new UsernameNotFoundException("User Not Found with email: " + email);
    }
}
