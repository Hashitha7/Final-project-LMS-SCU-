<div align="center">
  <h1>🎓 Modernistic LMS with AI Answer Analyst System</h1>
  <p><b>A modern, full-stack Learning Management System built with React, Spring Boot, and AI.</b></p>
  
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen.svg?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  
  <br />
</div>

## 📖 Overview

**Modernistic LMS** is a comprehensive educational platform designed to streamline teaching, learning, and administration. It integrates an innovative **Science AI Answer Analyst System** to automatically grade and provide feedback on student submissions.

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [🗄️ Database Setup](#️-database-setup)
- [📚 API Overview](#-api-overview)
- [👥 Demo Users](#-demo-users)

---

## ✨ Features

### 🎓 For Students
- **Course Browsing:** Discover and enroll in a variety of courses.
- **Interactive Learning:** Watch video lessons and download PDF study materials.
- **Progress Tracking:** Monitor grades and performance analytics over time.
- **Seamless Payments:** Make online and offline payments for course enrollments.

### 👨‍🏫 For Teachers
- **Course Management:** Create, update, and organize educational content.
- **Resource Uploads:** Share video tutorials, PDF notes, and assignments easily.
- **Automated Grading:** Let the AI Answer Analyst help grade science essays .
- **Communication:** Schedule Zoom classes directly and send SMS notifications.

### 🛡️ For Administrators
- **User Management:** Oversee all students and teachers on the platform.
- **Financial Oversight:** Track revenue, course payments, and system finances.
- **System Configuration:** Manage access roles and overall platform settings.

---

## 🛠️ Technology Stack

| Frontend ⚛️ | Backend 🍃 | Database 🗄️ | Integrations 🔌 |
|---|---|---|---|
| **React 18** | **Spring Boot 3.2** | **MySQL 8.0** | **Zoom API** |
| Vite | Java 17 | **SMS Gateway** |
| CSS | Spring Security (JWT) | **Science AI Analyst (Python)** |
| Radix UI / Shadcn | Maven | |

---

## 📦 Prerequisites

Ensure your development environment meets the following requirements before proceeding:
*   **Node.js** (v18 or higher) & **npm**
*   **Java Development Kit** (JDK 17 or higher)
*   **Maven** (3.8+)
*   **MySQL Server** (8.0+)
*   **Python 3.8+** (for the AI Analyst System)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd "Modernistic LMS-hub"
```

### 2. Start the Backend (Spring Boot)
```bash
cd modernistic-lms-backend
mvn clean install
mvn spring-boot:run
```
> **Note:** The backend will be available at `http://localhost:8080`

### 3. Start the Frontend (React)
```bash
cd modernistic-lms-frontend
npm install
npm run dev
```
> **Note:** The frontend will be available at `http://localhost:5173`

### 4. Start the AI Analyst System (Python)
```bash
cd "science -answer-analyst-system"
pip install -r requirements.txt
python app.py
```

---

## 🗄️ Database Setup

By default, the backend uses an **H2 In-Memory Database** which requires zero configuration and resets on every restart. 

To use **MySQL** for persistent data (Recommended):
1. Create a MySQL database named `modernistic_lms`.
2. Open `modernistic-lms-backend/src/main/resources/application.properties`.
3. Uncomment or add the MySQL configurations:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/modernistic_lms
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

## 👥 Demo Users

You can use the following default credentials to explore the system:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@modernisticlms.com` | `demo123` |
| **Teacher** | `teacher@modernisticlms.com` | `demo123` |
| **Student** | `student@modernisticlms.com` | `demo123` |

---

## 📚 API Overview

The backend exposes a RESTful API protected by JWT authentication.

*   **Auth:** `POST /api/auth/login`, `POST /api/auth/register`
*   **Users:** `GET /api/users`, `GET /api/users/me`
*   **Courses:** `GET /api/courses`, `POST /api/courses`
*   **Exams:** `GET /api/exams`, `POST /api/exams`
*   **AI Analyst:** `POST /api/science-analyst/analyze`

*All protected endpoints require an `Authorization: Bearer <token>` header.*

---

<div align="center">
  <p><b>Built with  elevate modern education</b></p>
</div>
