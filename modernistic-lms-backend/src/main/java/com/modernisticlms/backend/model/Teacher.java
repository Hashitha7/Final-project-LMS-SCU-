package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "teacher")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

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

    private String qualification;

    private String status;

    @Column(length = 5000)
    private String description;

    private String imageUrl;

    private String coverImage;

    @Column(unique = true)
    private String urlName;

    private String zoomUserId;

    private String accHolderName;

    private String bankName;

    private String bankNumber;

    private String branchName;

    private int maxEnrolls = 0;

    @Column(length = 15)
    private String privileges = "0:0:0";
}
