# 🗄️ EduSpark Hub - MySQL Database Setup Guide

## Prerequisites

1. **MySQL Server** installed and running
   - Download: https://dev.mysql.com/downloads/mysql/
   - Default port: 3306

2. **MySQL Workbench** (Optional but recommended)
   - Download: https://dev.mysql.com/downloads/workbench/

## 📋 Quick Setup Steps

### Method 1: Using MySQL Workbench (Recommended)

#### Step 1: Connect to MySQL Server
1. Open **MySQL Workbench**
2. Click on your local MySQL connection (usually `Local instance MySQL80`)
3. Enter your root password (default: `1234` or the one you set during installation)

#### Step 2: Create Database
1. Open the SQL script: `database/01_create_database.sql`
2. Click **Execute** (⚡ lightning icon) or press `Ctrl+Shift+Enter`
3. Verify: You should see "Database eduspark_hub created successfully!"

#### Step 3: Create Tables (Optional - Spring Boot will auto-create)
**Note:** Spring Boot JPA will automatically create tables when you run the application. This step is optional.

1. Open the SQL script: `database/02_create_tables.sql`
2. Click **Execute** (⚡ lightning icon)
3. Verify: You should see "All tables created successfully!"

#### Step 4: Insert Sample Data (Optional)
1. Open the SQL script: `database/03_insert_sample_data.sql`
2. Click **Execute** (⚡ lightning icon)
3. Verify: You should see a count of inserted records

### Method 2: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Run the scripts
source C:/Users/User/Downloads/New folder/New folder (2)/eduspark-hub-backend/database/01_create_database.sql
source C:/Users/User/Downloads/New folder/New folder (2)/eduspark-hub-backend/database/02_create_tables.sql
source C:/Users/User/Downloads/New folder/New folder (2)/eduspark-hub-backend/database/03_insert_sample_data.sql
```

## ⚙️ Configuration

### Update Database Password (if different)

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

### Database Connection Details

- **Database Name:** `eduspark_hub`
- **Host:** `localhost`
- **Port:** `3306`
- **Username:** `root`
- **Password:** `1234` (change in application.properties if different)

## 🚀 Running the Application

1. **Start MySQL Server** (if not already running)

2. **Run Spring Boot Application:**
   ```bash
   cd eduspark-hub-backend
   mvn spring-boot:run
   ```

3. **Verify Connection:**
   - Check console logs for: `HikariPool-1 - Start completed`
   - You should see SQL statements being logged

## 📊 Database Schema

### Main Tables

1. **users** - Admin, Teachers, and Students
2. **courses** - Course information
3. **lessons** - Video and PDF lessons
4. **school_classes** - Physical class schedules
5. **zoom_classes** - Online Zoom sessions
6. **exams** - Exam papers and questions
7. **payments** - Payment transactions
8. **attendance** - Attendance records
9. **notifications** - System notifications
10. **sms_logs** - SMS message logs
11. **assignments** - Course assignments
12. **submissions** - Student assignment submissions

## 👥 Demo Users

| Email | Password | Role |
|-------|----------|------|
| admin@eduspark.com | demo123 | ADMIN |
| james@eduspark.com | demo123 | TEACHER |
| sarah@eduspark.com | demo123 | TEACHER |
| alex@eduspark.com | demo123 | STUDENT |
| emma@eduspark.com | demo123 | STUDENT |
| michael@eduspark.com | demo123 | STUDENT |

## 🔧 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- **Solution:** Update password in `application.properties`

### Error: "Communications link failure"
- **Solution:** Make sure MySQL server is running
- Check: Services → MySQL80 → Start

### Error: "Unknown database 'eduspark_hub'"
- **Solution:** Run `01_create_database.sql` script first

### Tables not created
- **Solution:** Spring Boot will auto-create tables on first run
- Check: `spring.jpa.hibernate.ddl-auto=update` in application.properties

## 📝 Useful MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use eduspark_hub database
USE eduspark_hub;

-- Show all tables
SHOW TABLES;

-- Count records in users table
SELECT COUNT(*) FROM users;

-- View all users
SELECT id, name, email, role FROM users;

-- View all courses
SELECT id, title, grade, price, status FROM courses;

-- Drop database (WARNING: Deletes all data!)
DROP DATABASE eduspark_hub;
```

## 🔄 Switching Back to H2 (In-Memory Database)

If you want to switch back to H2 for testing:

1. Edit `src/main/resources/application.properties`
2. Comment out MySQL configuration
3. Uncomment H2 configuration
4. Restart the application

## 📚 Additional Resources

- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Hibernate Documentation](https://hibernate.org/orm/documentation/)
