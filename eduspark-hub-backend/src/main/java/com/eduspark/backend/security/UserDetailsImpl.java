package com.eduspark.backend.security;

import com.eduspark.backend.model.Institute;
import com.eduspark.backend.model.Teacher;
import com.eduspark.backend.model.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String email;
    private String role; // "INSTITUTE", "TEACHER", "STUDENT"

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String name, String email, String password, String role,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.authorities = authorities;
    }

    public static UserDetailsImpl buildFromInstitute(Institute institute) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("INSTITUTE"));
        return new UserDetailsImpl(institute.getId(), institute.getName(), institute.getEmail(),
                institute.getPassword(), "INSTITUTE", authorities);
    }

    public static UserDetailsImpl buildFromTeacher(Teacher teacher) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("TEACHER"));
        return new UserDetailsImpl(teacher.getId(), teacher.getName(), teacher.getEmail(),
                teacher.getPassword(), "TEACHER", authorities);
    }

    public static UserDetailsImpl buildFromStudent(Student student) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("STUDENT"));
        return new UserDetailsImpl(student.getId(), student.getName(), student.getEmail(),
                student.getPassword(), "STUDENT", authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Must match the format passed to authenticationManager.authenticate()
        // which is "email:ROLE" — so DaoAuthenticationProvider can verify correctly.
        return email + ":" + role;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id) && Objects.equals(role, user.role);
    }
}
