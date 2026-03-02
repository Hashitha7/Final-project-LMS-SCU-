package com.modernisticlms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "institute")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Institute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String mobile;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(length = 5000)
    private String description;

    private String imageUrl;

    private String status;

    private String noticeHeader;

    @Column(length = 1500)
    private String noticeMsg;

    private LocalDateTime noticeTimestamp;

    private Long currentUsage = 0L;

    private Long maxStorage = 0L;

    private Integer instituteRefId;

    @Column(length = 15)
    private String institutePrivileges = "0:0";

    private java.math.BigDecimal percentage;
}
