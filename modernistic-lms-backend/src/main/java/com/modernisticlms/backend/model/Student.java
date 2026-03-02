package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "student")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String mobile;

    private String password;

    private String gender;

    private LocalDate dob;

    private String grade;

    private String school;

    private String address;

    private String district;

    private String province;

    private String status;

    private String verifyKey;

    private String zoomName;

    private String zoomLastName;

    private String zoomUserId;

    private String zoomUserEmail;

    private String currentMeetingId;

    @Column(columnDefinition = "LONGTEXT")
    private String currentZoomMeetingUrl;
}

