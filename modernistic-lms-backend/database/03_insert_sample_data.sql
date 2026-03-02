-- =====================================================
-- Modernistic LMS - Sample Data Insert Script
-- =====================================================
-- Password for all users: demo123
-- Hashed with BCrypt: $2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6
-- =====================================================

USE modernistic_lms;

-- Insert Users
INSERT INTO users (name, email, password, mobile, role, grade, status, created_at) VALUES
('Admin User', 'admin@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0771234567', 'ADMIN', NULL, 'active', NOW()),
('Dr. James Carter', 'james@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0777654321', 'TEACHER', NULL, 'active', NOW()),
('Sarah Johnson', 'sarah@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0779876543', 'TEACHER', NULL, 'active', NOW()),
('Alex Rivera', 'alex@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0761234567', 'STUDENT', '10th', 'active', NOW()),
('Emma Wilson', 'emma@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0762345678', 'STUDENT', '10th', 'active', NOW()),
('Michael Brown', 'michael@modernisticlms.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', '0763456789', 'STUDENT', '11th', 'active', NOW());

-- Insert Courses
INSERT INTO courses (title, description, teacher_id, grade, price, status, image, created_at) VALUES
('Advanced Mathematics', 'A deep dive into calculus and algebra for advanced students.', 2, '10th', 0.00, 'active', '📐', NOW()),
('Physics 101', 'Introduction to mechanics, thermodynamics, and electromagnetism.', 2, '10th', 99.99, 'active', '⚛️', NOW()),
('Chemistry Fundamentals', 'Basic concepts of organic and inorganic chemistry.', 3, '11th', 79.99, 'active', '🧪', NOW()),
('English Literature', 'Exploring classic and modern literature.', 3, '10th', 0.00, 'active', '📚', NOW());

-- Insert Lessons
INSERT INTO lessons (title, course_id, description, video_url, pdf_url, duration_minutes, order_index, created_at) VALUES
('Introduction to Calculus', 1, 'Learn the basics of differential calculus.', 'https://youtube.com/watch?v=sample1', 'https://example.com/calculus.pdf', 45, 1, NOW()),
('Algebra Fundamentals', 1, 'Master algebraic equations and expressions.', 'https://youtube.com/watch?v=sample2', 'https://example.com/algebra.pdf', 50, 2, NOW()),
('Newton\'s Laws of Motion', 2, 'Understanding the three laws of motion.', 'https://youtube.com/watch?v=sample3', 'https://example.com/newton.pdf', 40, 1, NOW()),
('Thermodynamics Basics', 2, 'Introduction to heat and energy transfer.', 'https://youtube.com/watch?v=sample4', 'https://example.com/thermo.pdf', 55, 2, NOW());

-- Insert School Classes
INSERT INTO school_classes (name, room, teacher_id, course_id, schedule, created_at) VALUES
('Math Lab A', 'Room 101', 2, 1, 'Monday 10:00 AM - 12:00 PM', NOW()),
('Physics Lab B', 'Room 202', 2, 2, 'Wednesday 2:00 PM - 4:00 PM', NOW()),
('Chemistry Lab C', 'Room 303', 3, 3, 'Friday 9:00 AM - 11:00 AM', NOW());

-- Insert Zoom Classes
INSERT INTO zoom_classes (title, course_id, teacher_id, start_time, duration_minutes, meeting_id, meeting_password, join_url, status, created_at) VALUES
('Calculus Review Session', 1, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 60, '123-456-789', 'calc2024', 'https://zoom.us/j/123456789', 'scheduled', NOW()),
('Physics Q&A', 2, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 45, '987-654-321', 'phys2024', 'https://zoom.us/j/987654321', 'scheduled', NOW()),
('Chemistry Lab Demo', 3, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 90, '555-123-456', 'chem2024', 'https://zoom.us/j/555123456', 'scheduled', NOW());

-- Insert Exams
INSERT INTO exams (title, course_id, duration_minutes, total_marks, passing_marks, instructions, questions, status, created_at) VALUES
('Calculus Midterm', 1, 90, 100, 40, 'Answer all questions. Show your work.', '[]', 'published', NOW()),
('Physics Final Exam', 2, 120, 100, 50, 'Closed book exam. No calculators allowed.', '[]', 'draft', NOW());

-- Insert Payments
INSERT INTO payments (student_id, course_id, amount, method, status, transaction_id, created_at) VALUES
(4, 2, 99.99, 'STRIPE', 'completed', 'txn_1234567890', NOW()),
(5, 2, 99.99, 'BANK_DEPOSIT', 'pending', NULL, NOW()),
(6, 3, 79.99, 'STRIPE', 'completed', 'txn_0987654321', NOW());

-- Insert Attendance
INSERT INTO attendance (class_id, date, records, created_at) VALUES
(1, CURDATE(), '{"4": "present", "5": "present"}', NOW()),
(2, CURDATE(), '{"4": "present", "5": "absent"}', NOW());

-- Insert Notifications
INSERT INTO notifications (title, message, type, read_by, created_at) VALUES
('Welcome to Modernistic LMS!', 'Your account has been created successfully. Start exploring courses now!', 'info', '', NOW()),
('New Course Available', 'Chemistry Fundamentals is now available for enrollment.', 'announcement', '', NOW()),
('Exam Reminder', 'Your Calculus Midterm is scheduled for next week.', 'warning', '', NOW());

-- Insert SMS Logs
INSERT INTO sms_logs (recipient, message, status, sent_at) VALUES
('0761234567', 'Welcome to Modernistic LMS! Your account is now active.', 'sent', NOW()),
('0762345678', 'Reminder: Your payment for Physics 101 is pending.', 'sent', NOW());

-- Insert Assignments
INSERT INTO assignments (title, course_id, instructions, due_date, max_marks, created_at) VALUES
('Algebra Homework 1', 1, 'Complete exercises 1-10 on page 42 of your textbook.', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 50, NOW()),
('Physics Lab Report', 2, 'Write a detailed report on Newton\'s Laws experiment.', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 100, NOW()),
('Chemistry Research Paper', 3, 'Research and write about organic compounds.', DATE_ADD(CURDATE(), INTERVAL 21 DAY), 100, NOW());

-- Insert Submissions
INSERT INTO submissions (assignment_id, student_id, content, file_url, grade, feedback, submitted_at, graded_at) VALUES
(1, 4, 'Completed all exercises with detailed solutions.', 'https://example.com/alex_homework1.pdf', 45, 'Excellent work! Minor errors in question 7.', NOW(), NOW()),
(2, 5, 'Lab report on Newton\'s Laws with observations.', 'https://example.com/emma_labreport.pdf', NULL, NULL, NOW(), NULL);

-- Show confirmation
SELECT 'Sample data inserted successfully!' AS Status;
SELECT 
    (SELECT COUNT(*) FROM users) AS Users,
    (SELECT COUNT(*) FROM courses) AS Courses,
    (SELECT COUNT(*) FROM lessons) AS Lessons,
    (SELECT COUNT(*) FROM zoom_classes) AS ZoomClasses,
    (SELECT COUNT(*) FROM exams) AS Exams,
    (SELECT COUNT(*) FROM payments) AS Payments,
    (SELECT COUNT(*) FROM notifications) AS Notifications;

