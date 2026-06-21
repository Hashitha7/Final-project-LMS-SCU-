-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: modernistic_lms
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_status` int NOT NULL,
  `class_on_going_status` varchar(15) DEFAULT 'NOT_STARTED',
  `description` longtext,
  `fee` decimal(38,2) DEFAULT NULL,
  `first_week_free` bit(1) NOT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `last_meeting_started_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `syllabus` longtext,
  `unique_hash_code` varchar(255) DEFAULT NULL,
  `video_size` bigint NOT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `zoom_join_url` longtext,
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_meeting_password` varchar(255) DEFAULT NULL,
  `zoom_start_url` longtext,
  `institute_teacher_id` bigint DEFAULT NULL,
  `teacher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjjlfw7ung15al09tcjmc3xk1b` (`institute_teacher_id`),
  KEY `FK28f8ba9n0feejnamfay479ae1` (`teacher_id`),
  CONSTRAINT `FK28f8ba9n0feejnamfay479ae1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`),
  CONSTRAINT `FKjjlfw7ung15al09tcjmc3xk1b` FOREIGN KEY (`institute_teacher_id`) REFERENCES `institute_teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (11,1,'NOT_STARTED',NULL,0.00,_binary '','Grade 11',NULL,NULL,'Grade 11 Physics',NULL,NULL,NULL,0,NULL,'https://zoom.us/j/9302186176?pwd=0gdd5w',NULL,NULL,NULL,NULL,13);
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_attendance`
--

DROP TABLE IF EXISTS `class_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_time` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `student_type` varchar(255) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `class_id` bigint NOT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKksyk096dilrbh6w7032ldgp1u` (`class_id`),
  KEY `FKnvum0luy08nqqgfwutinr7227` (`student_id`),
  CONSTRAINT `FKksyk096dilrbh6w7032ldgp1u` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FKnvum0luy08nqqgfwutinr7227` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_attendance`
--

LOCK TABLES `class_attendance` WRITE;
/*!40000 ALTER TABLE `class_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_day_time`
--

DROP TABLE IF EXISTS `class_day_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_day_time` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day` varchar(255) DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `class_id` bigint NOT NULL,
  `day_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKirhh7vpy2gstt9dj1yn3d5bwf` (`class_id`),
  CONSTRAINT `FKirhh7vpy2gstt9dj1yn3d5bwf` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_day_time`
--

LOCK TABLES `class_day_time` WRITE;
/*!40000 ALTER TABLE `class_day_time` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_day_time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_enroll`
--

DROP TABLE IF EXISTS `class_enroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_enroll` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_time` datetime(6) DEFAULT NULL,
  `enroll_type` varchar(255) DEFAULT NULL,
  `month` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `year` int NOT NULL,
  `class_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKei0ij4qsrpja9e4th79uhrl6q` (`class_id`),
  KEY `FKfeq08exdta29hgxnbf7bg0o4p` (`student_id`),
  CONSTRAINT `FKei0ij4qsrpja9e4th79uhrl6q` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FKfeq08exdta29hgxnbf7bg0o4p` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_enroll`
--

LOCK TABLES `class_enroll` WRITE;
/*!40000 ALTER TABLE `class_enroll` DISABLE KEYS */;
INSERT INTO `class_enroll` VALUES (1,'2026-04-01 06:16:20.245677','FREE_TRIAL',NULL,'active','trial',0,11,1);
/*!40000 ALTER TABLE `class_enroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content_size` bigint NOT NULL,
  `delete_status` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `duration` double NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `view_count` int NOT NULL,
  `lesson_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpkf3sr17dui4p73dfa4fivwok` (`lesson_id`),
  CONSTRAINT `FKpkf3sr17dui4p73dfa4fivwok` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content`
--

LOCK TABLES `content` WRITE;
/*!40000 ALTER TABLE `content` DISABLE KEYS */;
/*!40000 ALTER TABLE `content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_on_going_status` varchar(15) DEFAULT 'NOT_STARTED',
  `created` datetime(6) DEFAULT NULL,
  `current_teacher_id` bigint DEFAULT NULL,
  `description` longtext,
  `end_date` date DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `last_meeting_started_at` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `no_of_installments` int NOT NULL,
  `no_of_semesters` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_fee` decimal(38,2) DEFAULT NULL,
  `updated` datetime(6) DEFAULT NULL,
  `video_size` bigint NOT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `zoom_join_url` longtext,
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_meeting_password` varchar(255) DEFAULT NULL,
  `zoom_start_url` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (3,'NOT_STARTED','2026-03-28 06:34:57.702997',13,'All in one ','2026-06-01','https://user-hash.s3.us-east-1.amazonaws.com/courses/985392a0-c77f-47ef-9c43-ed8161fc5bcc.jpg',NULL,'All in one (Grade 10 - chemistry)',1,1,'2026-04-01','active',2500.00,'2026-04-11 13:10:36.872173',0,'https://user-hash.s3.us-east-1.amazonaws.com/courses/aa12a63d-2453-44d5-b032-d6605d016929.mp4',NULL,NULL,NULL,NULL),(5,'NOT_STARTED','2026-04-25 13:49:20.513394',20,'All in Physics','2026-05-14','https://user-hash.s3.us-east-1.amazonaws.com/courses/f1585b40-4d67-4960-b12c-afaa0726a553__grade_10_Physics.jpeg',NULL,'Physics',2,1,'2026-04-17','active',7500.00,'2026-04-25 13:49:20.513394',0,'https://user-hash.s3.us-east-1.amazonaws.com/courses/c1252710-a44e-4d6e-ad92-a9f5b6df0c62__Grade_10_Physics_Video.mp4','https://zoom.us/j/798098016?pwd=wza62j',NULL,NULL,'https://zoom.us/j/798098016?pwd=wza62j');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enroll`
--

DROP TABLE IF EXISTS `course_enroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_enroll` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `updated` datetime(6) DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKc6dylncrce4dmk3ms1fvuftj8` (`course_id`),
  KEY `FKhv1xcwvubxtfhmnjlca9dxfyx` (`student_id`),
  CONSTRAINT `FKc6dylncrce4dmk3ms1fvuftj8` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`),
  CONSTRAINT `FKhv1xcwvubxtfhmnjlca9dxfyx` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enroll`
--

LOCK TABLES `course_enroll` WRITE;
/*!40000 ALTER TABLE `course_enroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_enroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_installment`
--

DROP TABLE IF EXISTS `course_installment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_installment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `installment_no` int NOT NULL,
  `course_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtp4ax7ap9vxrc3e5ygy1ykt3j` (`course_id`),
  CONSTRAINT `FKtp4ax7ap9vxrc3e5ygy1ykt3j` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_installment`
--

LOCK TABLES `course_installment` WRITE;
/*!40000 ALTER TABLE `course_installment` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_installment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_payment`
--

DROP TABLE IF EXISTS `course_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `approved_date_time` datetime(6) DEFAULT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deposit_type` varchar(255) DEFAULT NULL,
  `gateway_reference` varchar(255) DEFAULT NULL,
  `merchantrid` varchar(255) DEFAULT NULL,
  `payment_type` varchar(255) DEFAULT NULL,
  `slip_image_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `updated` datetime(6) DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `course_enroll_id` bigint DEFAULT NULL,
  `course_installment_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ffvbpgfvri40l0lms5d5rbpdw` (`gateway_reference`),
  UNIQUE KEY `UK_iwmcdenadf3qqvg69he4dobap` (`merchantrid`),
  KEY `FKayr70qecn9nadrau0hbd4a73o` (`course_id`),
  KEY `FKtc14r7y48kck964kdbdn081af` (`course_enroll_id`),
  KEY `FKpwkkd5fgg171f4731iokadx9r` (`course_installment_id`),
  CONSTRAINT `FKayr70qecn9nadrau0hbd4a73o` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`),
  CONSTRAINT `FKpwkkd5fgg171f4731iokadx9r` FOREIGN KEY (`course_installment_id`) REFERENCES `course_installment` (`id`),
  CONSTRAINT `FKtc14r7y48kck964kdbdn081af` FOREIGN KEY (`course_enroll_id`) REFERENCES `course_enroll` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_payment`
--

LOCK TABLES `course_payment` WRITE;
/*!40000 ALTER TABLE `course_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses_day_time`
--

DROP TABLE IF EXISTS `courses_day_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses_day_time` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day` varchar(255) DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `day_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKd5lola0wghrmvx8tnw5db38gt` (`course_id`),
  CONSTRAINT `FKd5lola0wghrmvx8tnw5db38gt` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses_day_time`
--

LOCK TABLES `courses_day_time` WRITE;
/*!40000 ALTER TABLE `courses_day_time` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses_day_time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deposit`
--

DROP TABLE IF EXISTS `deposit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deposit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `date_time` datetime(6) DEFAULT NULL,
  `deposit_type` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `class_enroll_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_mq5i4as8d504m0mo0vhaovg8e` (`class_enroll_id`),
  CONSTRAINT `FKhbrkrs2v3tkxg8svef741jabk` FOREIGN KEY (`class_enroll_id`) REFERENCES `class_enroll` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deposit`
--

LOCK TABLES `deposit` WRITE;
/*!40000 ALTER TABLE `deposit` DISABLE KEYS */;
/*!40000 ALTER TABLE `deposit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institute`
--

DROP TABLE IF EXISTS `institute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institute` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `current_usage` bigint DEFAULT NULL,
  `description` longtext,
  `email` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `institute_privileges` varchar(15) DEFAULT '0:0',
  `institute_ref_id` int DEFAULT NULL,
  `max_storage` bigint DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `notice_header` varchar(255) DEFAULT NULL,
  `notice_msg` varchar(1500) DEFAULT NULL,
  `notice_timestamp` datetime(6) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `percentage` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_lhi2pib6w2sila0htss9uy8km` (`email`),
  UNIQUE KEY `UK_4fluofncr6tyobf7k4c5uvda2` (`mobile`),
  UNIQUE KEY `UK_l3o6p6s08gnrr7xsj3xg5r2er` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institute`
--

LOCK TABLES `institute` WRITE;
/*!40000 ALTER TABLE `institute` DISABLE KEYS */;
INSERT INTO `institute` VALUES (1,0,NULL,'admin@modernisticlms.com',NULL,'0:0',1001,10737418240,'0771234567','Modernistic LMS Institute',NULL,NULL,NULL,'$2a$10$KWRGlYiRSmXqq02auTjKneaOIdUDCCda3kuTRTbytQYS46lWxHJf.',NULL,'active','admin');
/*!40000 ALTER TABLE `institute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `institute_teacher`
--

DROP TABLE IF EXISTS `institute_teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institute_teacher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `institute_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKh93nr0inf7pmd69fky3rklk8f` (`institute_id`,`teacher_id`),
  KEY `FKkcf1idffkewljau3vmwy895e6` (`teacher_id`),
  CONSTRAINT `FKkcf1idffkewljau3vmwy895e6` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`),
  CONSTRAINT `FKmnda1bx5jxe1hp771487bnbhd` FOREIGN KEY (`institute_id`) REFERENCES `institute` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `institute_teacher`
--

LOCK TABLES `institute_teacher` WRITE;
/*!40000 ALTER TABLE `institute_teacher` DISABLE KEYS */;
/*!40000 ALTER TABLE `institute_teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_status` int NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `fee` decimal(38,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `preview_video` varchar(255) DEFAULT NULL,
  `preview_video_size` bigint NOT NULL,
  `validity_days` int NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `lesson_order` int DEFAULT NULL,
  `resources_json` longtext,
  PRIMARY KEY (`id`),
  KEY `FK9yhaoqrjxt5gwmn6icp1lf35n` (`teacher_id`),
  CONSTRAINT `FK9yhaoqrjxt5gwmn6icp1lf35n` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson`
--

LOCK TABLES `lesson` WRITE;
/*!40000 ALTER TABLE `lesson` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_enroll`
--

DROP TABLE IF EXISTS `lesson_enroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_enroll` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active_status` int NOT NULL,
  `created` datetime(6) DEFAULT NULL,
  `enroll_date_time` datetime(6) DEFAULT NULL,
  `expire_date_time` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `updated` datetime(6) DEFAULT NULL,
  `class_enroll_id` bigint DEFAULT NULL,
  `course_enroll_id` bigint DEFAULT NULL,
  `lesson_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt31sjvk5otf2ry9e4fi4ax1nt` (`class_enroll_id`),
  KEY `FKai56oct2sabeakd89q7qe9k82` (`course_enroll_id`),
  KEY `FK6kj84y1tt47hfqlphtmvw3vah` (`lesson_id`),
  KEY `FKis58eu375uam1chddn7o2jefd` (`student_id`),
  CONSTRAINT `FK6kj84y1tt47hfqlphtmvw3vah` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`),
  CONSTRAINT `FKai56oct2sabeakd89q7qe9k82` FOREIGN KEY (`course_enroll_id`) REFERENCES `course_enroll` (`id`),
  CONSTRAINT `FKis58eu375uam1chddn7o2jefd` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FKt31sjvk5otf2ry9e4fi4ax1nt` FOREIGN KEY (`class_enroll_id`) REFERENCES `class_enroll` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_enroll`
--

LOCK TABLES `lesson_enroll` WRITE;
/*!40000 ALTER TABLE `lesson_enroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_enroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_payment`
--

DROP TABLE IF EXISTS `lesson_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `approved_timestamp` datetime(6) DEFAULT NULL,
  `created` datetime(6) DEFAULT NULL,
  `deposit_image` varchar(255) DEFAULT NULL,
  `gateway_reference` varchar(255) DEFAULT NULL,
  `merchantrid` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `updated` datetime(6) DEFAULT NULL,
  `lesson_enroll_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_aon2airw28vajkwjw15bdfrx6` (`gateway_reference`),
  UNIQUE KEY `UK_8p2tro7jopu7e9946pf4s7s80` (`merchantrid`),
  KEY `FK5441alftdcx9qoop4hv9soov7` (`lesson_enroll_id`),
  CONSTRAINT `FK5441alftdcx9qoop4hv9soov7` FOREIGN KEY (`lesson_enroll_id`) REFERENCES `lesson_enroll` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_payment`
--

LOCK TABLES `lesson_payment` WRITE;
/*!40000 ALTER TABLE `lesson_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deposit_slip` varchar(500) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `refund_reason` text,
  `status` varchar(255) DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (2,1500.00,1,'2026-03-30 13:10:10.922346',NULL,'card','Admin initiated refund','refunded',1,'TEST-OK-8080','2026-04-25 13:50:18.123008'),(4,2500.00,3,'2026-04-01 09:30:17.127072',NULL,'offline',NULL,'completed',5,NULL,'2026-04-25 13:50:16.487471');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `answers` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `no_of_answers_per_question` int NOT NULL,
  `no_of_questions` int NOT NULL,
  `paper_duration` double NOT NULL,
  `price` double NOT NULL,
  `question_paper_url` varchar(255) DEFAULT NULL,
  `quiz_type` varchar(255) DEFAULT NULL,
  `sell` int NOT NULL,
  `state` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `teacher_id` bigint NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKc2jgoslusmwb86uhtt533a8g8` (`teacher_id`),
  CONSTRAINT `FKc2jgoslusmwb86uhtt533a8g8` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz`
--

LOCK TABLES `quiz` WRITE;
/*!40000 ALTER TABLE `quiz` DISABLE KEYS */;
INSERT INTO `quiz` VALUES (3,NULL,'you have to complete all',0,0,120,0,'https://user-hash.s3.us-east-1.amazonaws.com/exams/93d41a9f-750c-4c51-a9ba-66309e476893.pdf','mcq',0,1,'mixed paper',13,NULL,3,'2026-03-31','live');
/*!40000 ALTER TABLE `quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_class`
--

DROP TABLE IF EXISTS `quiz_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_class` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `end_date_time` datetime(6) DEFAULT NULL,
  `enroll_month` int NOT NULL,
  `enroll_year` int NOT NULL,
  `start_date_time` datetime(6) DEFAULT NULL,
  `quiz_id` bigint NOT NULL,
  `class_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKppr9rhddah1eyaq6f4iudvt7d` (`quiz_id`),
  KEY `FK9wkb6ie386x9c0pvlm0g3hdtj` (`class_id`),
  CONSTRAINT `FK9wkb6ie386x9c0pvlm0g3hdtj` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FKppr9rhddah1eyaq6f4iudvt7d` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_class`
--

LOCK TABLES `quiz_class` WRITE;
/*!40000 ALTER TABLE `quiz_class` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_course`
--

DROP TABLE IF EXISTS `quiz_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `end_date_time` datetime(6) DEFAULT NULL,
  `start_date_time` datetime(6) DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7l8miadanpt531axmwhy038jb` (`course_id`),
  KEY `FKabuex8xs66wra76drjr5udi3y` (`quiz_id`),
  CONSTRAINT `FK7l8miadanpt531axmwhy038jb` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`),
  CONSTRAINT `FKabuex8xs66wra76drjr5udi3y` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_course`
--

LOCK TABLES `quiz_course` WRITE;
/*!40000 ALTER TABLE `quiz_course` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `science_answer`
--

DROP TABLE IF EXISTS `science_answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `science_answer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `analyzed_at` datetime(6) DEFAULT NULL,
  `extracted_text` text,
  `feedback` text,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `grade_label` varchar(255) DEFAULT NULL,
  `keyword_coverage` double DEFAULT NULL,
  `matched_count` int DEFAULT NULL,
  `matched_keywords` text,
  `missed_count` int DEFAULT NULL,
  `missed_keywords` text,
  `question_topic` varchar(255) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `similarity_score` double DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `total_keywords` int DEFAULT NULL,
  `word_count` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `science_answer`
--

LOCK TABLES `science_answer` WRITE;
/*!40000 ALTER TABLE `science_answer` DISABLE KEYS */;
INSERT INTO `science_answer` VALUES (48,'2026-04-25 13:45:47.271742',NULL,' **Paper Analysis (14 questions analyzed)**\n### Q1 [Unknown] (Score: 39.4%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 6 key concept(s): particles, atom, subatomic particles, matter, subatomic, charge.  You missed 6 concept(s). Try to include: neutrons, nucleus, centre, model, mixtures, protons.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 1. [Unknown] (Score: 20.3%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 2 key concept(s): nucleus, charge.  You missed 10 concept(s). Try to include: particles, neutrons, atom, subatomic particles, matter, subatomic, centre, model.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 2. [Unknown] (Score: 15.0%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 1 key concept(s): nucleus.  You missed 11 concept(s). Try to include: atom, protons, electrons, charged, electrically neutral planetary, electrons atom equal, electrons oppositely, electrons oppositely charged.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 3. [Unknown] (Score: 43.1%)\n Fair attempt. Your answer covers some concepts but misses several important points.  You correctly covered 6 key concept(s): atom, nucleus, protons, electrons, charged, number.  You missed 6 concept(s). Try to include: electrically neutral planetary, electrons atom equal, electrons oppositely, electrons oppositely charged, protons electrons, around nucleus.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q2 [Unknown] (Score: 54.0%)\n Fair attempt. Your answer covers some concepts but misses several important points.  You correctly covered 7 key concept(s): number, mass number, atom, neutrons, atomic number, mass, atomic.  You missed 5 concept(s). Try to include: aluminium, number atom, number aluminium, complete following, number neutrons.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q3 [Unknown] (Score: 39.7%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 5 key concept(s): number, atomic number, atomic, electrons, atom.  You missed 7 concept(s). Try to include: 11, mass number, respective energy levels, respective energy, mass number atomic, number atomic number, number atomic.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 6 [Unknown] (Score: 34.2%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 5 key concept(s): number, atomic number, atomic, electrons, atom.  You missed 7 concept(s). Try to include: 11, mass number, respective energy levels, respective energy, mass number atomic, number atomic number, number atomic.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 17 [Unknown] (Score: 19.3%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 1 key concept(s): chlorine.  You missed 11 concept(s). Try to include: molecule, atom, hydrogen chloride, atom hydrogen, hydrogen, chlorine atom, hydrogen chloride molecule, chloride molecule.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q4 [Unknown] (Score: 42.2%)\n Fair attempt. Your answer covers some concepts but misses several important points.  You correctly covered 5 key concept(s): group, period, periodic, fig, atom.  You missed 7 concept(s). Try to include: potassium, period periodic, potassium atom, found group period, group fig thus, fig table example, fig table.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q5 [Unknown] (Score: 50.7%)\n Fair attempt. Your answer covers some concepts but misses several important points.  You correctly covered 8 key concept(s): mass numbers, different mass, different mass numbers, element, numbers, atoms, mass, number.  You missed 4 concept(s). Try to include: mass numbers element, numbers element, atoms different mass, atoms different.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q6 [Unknown] (Score: 28.7%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 4 key concept(s): ionic, chloride, sodium chloride, sodium.  You missed 8 concept(s). Try to include: done sodium, done sodium chloride, formed ionic compounds, formed ionic, compounds lithium oxide, free distribution 172, suitable materials, 172 free.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### Q7 [Unknown] (Score: 39.9%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 7 key concept(s): electrons, stable, configuration, bonds, atoms, electronic, atom.  You missed 5 concept(s). Try to include: shell, valence shell, valence, sodium, stable electronic configuration.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 1. [Unknown] (Score: 16.3%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 2 key concept(s): atoms, element.  You missed 10 concept(s). Try to include: atoms different, vii, number, atoms different mass, numbers element, different mass, may atoms different, different mass numbers.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.\n\n### 2. [Unknown] (Score: 27.5%)\n Your answer needs improvement. Many key concepts are missing.  You correctly covered 3 key concept(s): molecule, fig, atoms.  You missed 9 concept(s). Try to include: hydrogen, hydrogen molecule, two hydrogen atoms, molecule hydrogen, two hydrogen, hydrogen atoms, fig 10, gives rise hydrogen.  Tip: Review the relevant textbook chapter and focus on the key terminology and concepts.','Grade10_Chemistry_Answer Sheet (Question and Answers).pdf','application/pdf','10','Needs Improvement',36.9,62,'Q1 particles, Q1 atom, Q1 subatomic particles, Q1 matter, Q1 subatomic, Q1 charge, 1. nucleus, 1. charge, 2. nucleus, 3. atom, 3. nucleus, 3. protons, 3. electrons, 3. charged, 3. number, Q2 number, Q2 mass number, Q2 atom, Q2 neutrons, Q2 atomic number, Q2 mass, Q2 atomic, Q3 number, Q3 atomic number, Q3 atomic, Q3 electrons, Q3 atom, 6 number, 6 atomic number, 6 atomic, 6 electrons, 6 atom, 17 chlorine, Q4 group, Q4 period, Q4 periodic, Q4 fig, Q4 atom, Q5 mass numbers, Q5 different mass, Q5 different mass numbers, Q5 element, Q5 numbers, Q5 atoms, Q5 mass, Q5 number, Q6 ionic, Q6 chloride, Q6 sodium chloride, Q6 sodium, Q7 electrons, Q7 stable, Q7 configuration, Q7 bonds, Q7 atoms, Q7 electronic, Q7 atom, 1. atoms, 1. element, 2. molecule, 2. fig, 2. atoms',106,'Q1 neutrons, Q1 nucleus, Q1 centre, Q1 model, Q1 mixtures, Q1 protons, 1. particles, 1. neutrons, 1. atom, 1. subatomic particles, 1. matter, 1. subatomic, 1. centre, 1. model, 1. mixtures, 1. protons, 2. atom, 2. protons, 2. electrons, 2. charged, 2. electrically neutral planetary, 2. electrons atom equal, 2. electrons oppositely, 2. electrons oppositely charged, 2. number, 2. protons electrons, 2. around nucleus, 3. electrically neutral planetary, 3. electrons atom equal, 3. electrons oppositely, 3. electrons oppositely charged, 3. protons electrons, 3. around nucleus, Q2 aluminium, Q2 number atom, Q2 number aluminium, Q2 complete following, Q2 number neutrons, Q3 11, Q3 mass number, Q3 respective energy levels, Q3 respective energy, Q3 mass number atomic, Q3 number atomic number, Q3 number atomic, 6 11, 6 mass number, 6 respective energy levels, 6 respective energy, 6 mass number atomic, 6 number atomic number, 6 number atomic, 17 molecule, 17 atom, 17 hydrogen chloride, 17 atom hydrogen, 17 hydrogen, 17 chlorine atom, 17 hydrogen chloride molecule, 17 chloride molecule, 17 chlorine atom hydrogen, 17 fig 10, 17 chloride, Q4 potassium, Q4 period periodic, Q4 potassium atom, Q4 found group period, Q4 group fig thus, Q4 fig table example, Q4 fig table, Q5 mass numbers element, Q5 numbers element, Q5 atoms different mass, Q5 atoms different, Q6 done sodium, Q6 done sodium chloride, Q6 formed ionic compounds, Q6 formed ionic, Q6 compounds lithium oxide, Q6 free distribution 172, Q6 suitable materials, Q6 172 free, Q7 shell, Q7 valence shell, Q7 valence, Q7 sodium, Q7 stable electronic configuration, 1. atoms different, 1. vii, 1. number, 1. atoms different mass, 1. numbers element, 1. different mass, 1. may atoms different, 1. different mass numbers, 1. may atoms, 1. mass numbers element, 2. hydrogen, 2. hydrogen molecule, 2. two hydrogen atoms, 2. molecule hydrogen, 2. two hydrogen, 2. hydrogen atoms, 2. fig 10, 2. gives rise hydrogen, 2. configuration helium','Multi-Question Paper',33.6,31.4,'Dinithi H','Chemistry','Modernistic LMS Institute',NULL,168,1112);
/*!40000 ALTER TABLE `science_answer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms`
--

DROP TABLE IF EXISTS `sms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` int NOT NULL,
  `date_time` datetime(6) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `sms_body` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type_of_sms` varchar(255) DEFAULT NULL,
  `institute_id` bigint NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK201khl8cfaedftwr25po93tip` (`institute_id`),
  KEY `FKojky65n86ysug4b88xtp8y7yw` (`teacher_id`),
  CONSTRAINT `FK201khl8cfaedftwr25po93tip` FOREIGN KEY (`institute_id`) REFERENCES `institute` (`id`),
  CONSTRAINT `FKojky65n86ysug4b88xtp8y7yw` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms`
--

LOCK TABLES `sms` WRITE;
/*!40000 ALTER TABLE `sms` DISABLE KEYS */;
INSERT INTO `sms` VALUES (1,0,'2026-04-01 05:21:10.184367','[Scheduled: 2026-04-04] All are done','Grade 10 - Chem','[Scheduled: 2026-04-04] All are done','Delivered','Campaign',1,NULL),(2,0,'2026-04-24 14:51:20.177453','[Scheduled: 2026-04-17] Introduction Of Physics Started','Grade 11 Physics','[Scheduled: 2026-04-17] Introduction Of Physics Started','Delivered','Campaign',1,NULL);
/*!40000 ALTER TABLE `sms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `current_meeting_id` varchar(255) DEFAULT NULL,
  `current_zoom_meeting_url` longtext,
  `district` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `verify_key` varchar(255) DEFAULT NULL,
  `zoom_last_name` varchar(255) DEFAULT NULL,
  `zoom_name` varchar(255) DEFAULT NULL,
  `zoom_user_email` varchar(255) DEFAULT NULL,
  `zoom_user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_fe0i52si7ybu0wjedj6motiim` (`email`),
  UNIQUE KEY `UK_exbwqcphwk6e63djot72evi1g` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,NULL,NULL,NULL,NULL,NULL,'student@modernisticlms.com',NULL,'Grade 10','0761234567','Demo Student','$2a$10$h57D2AhzQjAxuFHqnwGCsegBhVII5xzlLx1vzMzG9s0CHEQQnCU6G',NULL,'Modernistic LMS School','active',NULL,NULL,NULL,NULL,NULL),(5,NULL,NULL,NULL,NULL,NULL,'hashithd77@gmail.com',NULL,'11','0702567907','hashith d','$2a$10$9uBIPzcqVNuG4QufiXQgxu1kJSkfXmIkTQmsDDlQRvl8bDiG9.V1G',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(7,NULL,NULL,NULL,NULL,NULL,'Sisira@gmail.com',NULL,'11','0702567904','Sisira','$2a$10$9lRsVgV9V5ECKHLnPPyesu5tzIlQ5Vk.YbVsEC17EMKhjYe1DvmHG',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(8,NULL,NULL,NULL,NULL,NULL,'dulminaa@gmail.com',NULL,'Grade 10 ','0712535687','Dulmina A','$2a$10$HtXPk/kZOncL49saG4KqguL6jDzvA9WxbGWMwcs/q9dJ.GC8GxaSO',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(9,NULL,NULL,NULL,NULL,NULL,'ravindih@gmail.com',NULL,'10','0781234847','Ravindi H','$2a$10$JEW4LXPug8TDkqMY3Gt6M.a/ix0uzMsI.nRDcjQyqZTOso4jQkPj2',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(10,NULL,NULL,NULL,NULL,NULL,'chandunus@gmail.com',NULL,'10','0784564257','Chandunu S','$2a$10$r4YO4gvu7zca8gA41jHgweRn5RBCwiVlR2L5BwtoJEsvwfgws1Twi',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(11,NULL,NULL,NULL,NULL,NULL,'daninduh@gmail.com',NULL,'11','0785464874','Danindu H','$2a$10$Ed5cBEEvPOwNpAOdK9AFKeyhVDd3j/CK3J7q9hYrrli3mG1yjldvK',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(12,NULL,NULL,NULL,NULL,NULL,'ravinduah@gmail.com',NULL,'10','0786936546','Ravindu AH','$2a$10$mqBmHCkc5NijUtyltGf9WO3pi.iZpQVepTZqado9M5663ocVMOaLe',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(13,NULL,NULL,NULL,NULL,NULL,'manaharij@gmail.com',NULL,'10','0759636754','Manahari H','$2a$10$Nlupal5yGmvgIbCDIQQBpODruCQdZkldgXSQABkJDceDuw3hwWVwK',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL),(14,NULL,NULL,NULL,NULL,NULL,'dinithih@gmail.com',NULL,'10','0786898747','Dinithi H','$2a$10$oUQ7uhVKrFmyMBGqQunK.eW0giQI0Wmhq1wCFaCJn2KKm36ZBjZEG',NULL,NULL,'active',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_quiz_answers`
--

DROP TABLE IF EXISTS `student_quiz_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_quiz_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `answers` longtext,
  `end_date_time` datetime(6) DEFAULT NULL,
  `is_final_mark_calculated` int NOT NULL,
  `mark` int NOT NULL,
  `start_date_time` datetime(6) DEFAULT NULL,
  `state` int NOT NULL,
  `teacher_comments` longtext,
  `class_enroll_id` bigint DEFAULT NULL,
  `course_enroll_id` bigint DEFAULT NULL,
  `quiz_class_id` bigint DEFAULT NULL,
  `quiz_course_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  `quiz_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpywmtr0m28bba5p2qqhyy4u27` (`class_enroll_id`),
  KEY `FKapuq14c8nch7axvemoik4kd7q` (`course_enroll_id`),
  KEY `FKfmjxu5md9x1iqy3826bce2rg3` (`quiz_class_id`),
  KEY `FK84amlhoui9wbi8hcnyuf1cq3c` (`quiz_course_id`),
  KEY `FKom4o6s04gfkv7aldblu5i5m5q` (`student_id`),
  KEY `FKk5c0tqmpenrc0kcnty0xgc2t` (`quiz_id`),
  CONSTRAINT `FK84amlhoui9wbi8hcnyuf1cq3c` FOREIGN KEY (`quiz_course_id`) REFERENCES `quiz_course` (`id`),
  CONSTRAINT `FKapuq14c8nch7axvemoik4kd7q` FOREIGN KEY (`course_enroll_id`) REFERENCES `course_enroll` (`id`),
  CONSTRAINT `FKfmjxu5md9x1iqy3826bce2rg3` FOREIGN KEY (`quiz_class_id`) REFERENCES `quiz_class` (`id`),
  CONSTRAINT `FKk5c0tqmpenrc0kcnty0xgc2t` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`),
  CONSTRAINT `FKom4o6s04gfkv7aldblu5i5m5q` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FKpywmtr0m28bba5p2qqhyy4u27` FOREIGN KEY (`class_enroll_id`) REFERENCES `class_enroll` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_quiz_answers`
--

LOCK TABLES `student_quiz_answers` WRITE;
/*!40000 ALTER TABLE `student_quiz_answers` DISABLE KEYS */;
INSERT INTO `student_quiz_answers` VALUES (7,'{\"responses\":{\"uploaded_file\":{\"type\":\"file\",\"name\":\"Viva_QA_Hashitha_Danidu.pdf\",\"size\":null,\"url\":null},\"essay\":{\"type\":\"essay\",\"text\":\"gngcf\"}},\"autoScore\":{\"mcqScore\":0,\"mcqMaxScore\":0},\"tabWarnings\":0}','2026-04-06 05:15:07.000000',0,0,'2026-04-06 04:15:02.000000',1,NULL,NULL,NULL,NULL,NULL,1,3);
/*!40000 ALTER TABLE `student_quiz_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `acc_holder_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_number` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `description` longtext,
  `dob` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `max_enrolls` int NOT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `privileges` varchar(15) DEFAULT '0:0:0',
  `qualification` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `url_name` varchar(255) DEFAULT NULL,
  `zoom_user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_3kv6k1e64a9gylvkn3gnghc2q` (`email`),
  UNIQUE KEY `UK_2tae79fv6555vkv876wnmivna` (`mobile`),
  UNIQUE KEY `UK_eadgdt3g9bt22geqh2ehnd4o4` (`url_name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (13,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'hashithadanindu10@gmail.com',NULL,'https://user-hash.s3.us-east-1.amazonaws.com/teachers/6034c0c9-ccfb-4f2d-ad22-e3501e68f30f.jpg',46,'0788993717','Hashitha Danidu','$2a$10$hm/y9BZT29Vnpppw8SLvZOYWHYisJ6QEWi0dpGLkUGwcOZ2K5mbmi','0:0:0','Bsc ','active',NULL,NULL),(14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'teacher@modernisticlms.com',NULL,NULL,100,'0779876543','Demo Teacher','$2a$10$FdOz9ShX2kJPoedccsAX3.V98IA8/m7OME6DjtccbfcJmMyO0Bm2e','0:0:0','B.Sc. in Education','active',NULL,NULL),(20,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'hashithd77@gmail.com',NULL,'https://user-hash.s3.us-east-1.amazonaws.com/teachers/a1249704-8b29-4028-88bf-1775f8a4c830__Teacher_PIC.jpg',65,'0745698476','Anuradha R','$2a$10$oymyxqOP7Koj0igpxcYTsOsknHKZFgzCYYqX19cELrzCYo1rGhXW2','0:0:0','Bsc ','active',NULL,NULL);
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zoom_account`
--

DROP TABLE IF EXISTS `zoom_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zoom_account` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allocated_timestamp` datetime(6) DEFAULT NULL,
  `created_timestamp` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `last_acquired_timestamp` datetime(6) DEFAULT NULL,
  `max_participant_count` bigint DEFAULT NULL,
  `released_timestamp` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `zoom_user_id` varchar(255) DEFAULT NULL,
  `current_teacher_id` bigint DEFAULT NULL,
  `institute_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_c3thj5i8k1q5w5vqsmrd66c6p` (`zoom_user_id`),
  KEY `FKcx4i4olrcl4dlce2j4f0vnp1b` (`current_teacher_id`),
  KEY `FKgiy3nkpniks8apgxw9q31e3o8` (`institute_id`),
  CONSTRAINT `FKcx4i4olrcl4dlce2j4f0vnp1b` FOREIGN KEY (`current_teacher_id`) REFERENCES `institute_teacher` (`id`),
  CONSTRAINT `FKgiy3nkpniks8apgxw9q31e3o8` FOREIGN KEY (`institute_id`) REFERENCES `institute` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zoom_account`
--

LOCK TABLES `zoom_account` WRITE;
/*!40000 ALTER TABLE `zoom_account` DISABLE KEYS */;
/*!40000 ALTER TABLE `zoom_account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25 19:37:56
