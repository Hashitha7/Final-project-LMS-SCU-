# Modernistic LMS Backend

This is the Spring Boot backend for the Modernistic LMS LMS.

## Analysis of Frontend
The existing frontend was built using React + Vite with a local storage-based "mock database" (`LmsDataContext`). To fully professionalize the application, this backend replaces the local storage with a proper relational database and REST API.

### Key Features Implemented in Backend
- **User Management**: Support for Students, Teachers, and Admins.
- **Course Management**: Create, read, and manage courses.
- **Zoom Integration**: Schedule and manage Zoom classes.
- **Database**: H2 Database (in-memory) for development, easily switchable to MySQL/PostgreSQL.

## Tech Stack
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database
- Lombok

## How to Run

1.  **Prerequisites**: Ensure you have Java 17 and Maven installed.
2.  **Build**:
    ```bash
    mvn clean install
    ```
3.  **Run**:
    ```bash
    mvn spring-boot:run
    ```
    The server will start at `http://localhost:8080`.

## API Endpoints (`http://localhost:8080/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/users` | Get all users |
| GET | `/courses` | Get all courses |
| GET | `/courses/{id}` | Get course details |
| POST | `/courses` | Create a new course |
| GET | `/zoom` | Get all scheduled Zoom classes |

## Connecting Frontend

To connect the frontend to this backend:
1.  Update `vite.config.js` to proxy `/api` requests to `http://localhost:8080`.
2.  Refactor `src/contexts/LmsDataContext.jsx` to use `fetch` or `axios` instead of local storage.

