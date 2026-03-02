export const mockStats = {

    admin: {
        totalStudents: 1240,
        totalTeachers: 86,
        totalCourses: 64,
        revenue: 45200,
        attendanceRate: 94.2,
    },
    teacher: {
        myCourses: 5,
        totalStudents: 180,
        upcomingClasses: 3,
        pendingSubmissions: 12,
    },
    student: {
        enrolledCourses: 6,
        completedCourses: 2,
        avgGrade: 87.5,
        attendanceRate: 96.1,
    },
};
export const mockCourses = [
    { id: '1', title: 'Advanced Mathematics', teacher: 'Dr. James Carter', students: 42, grade: '10th', status: 'active', price: 0, progress: 68, lessons: 24, image: '📐' },
    { id: '2', title: 'Physics Fundamentals', teacher: 'Prof. Emily Stone', students: 38, grade: '11th', status: 'active', price: 49.99, progress: 45, lessons: 18, image: '⚛️' },
    { id: '3', title: 'English Literature', teacher: 'Ms. Diana Ross', students: 35, grade: '9th', status: 'active', price: 0, progress: 82, lessons: 20, image: '📚' },
    { id: '4', title: 'Computer Science 101', teacher: 'Mr. Alan Turing', students: 50, grade: '10th', status: 'active', price: 79.99, progress: 30, lessons: 30, image: '💻' },
    { id: '5', title: 'World History', teacher: 'Dr. Maria Lopez', students: 28, grade: '11th', status: 'draft', price: 0, progress: 55, lessons: 16, image: '🌍' },
    { id: '6', title: 'Biology Lab', teacher: 'Dr. Sarah Kim', students: 32, grade: '12th', status: 'active', price: 59.99, progress: 72, lessons: 22, image: '🧬' },
];
export const mockStudents = [
    { id: '1', name: 'Alex Rivera', email: 'alex@lincoln.edu', grade: '10th', courses: 6, avgGrade: 87.5, attendance: 96.1, status: 'active' },
    { id: '2', name: 'Jessica Park', email: 'jessica@lincoln.edu', grade: '11th', courses: 5, avgGrade: 92.3, attendance: 98.5, status: 'active' },
    { id: '3', name: 'Michael Brown', email: 'michael@lincoln.edu', grade: '10th', courses: 6, avgGrade: 78.9, attendance: 91.2, status: 'active' },
    { id: '4', name: 'Emma Wilson', email: 'emma@lincoln.edu', grade: '9th', courses: 5, avgGrade: 95.1, attendance: 99.0, status: 'active' },
    { id: '5', name: 'Daniel Lee', email: 'daniel@lincoln.edu', grade: '12th', courses: 4, avgGrade: 83.7, attendance: 88.5, status: 'inactive' },
    { id: '6', name: 'Sophia Martinez', email: 'sophia@lincoln.edu', grade: '11th', courses: 6, avgGrade: 90.2, attendance: 97.3, status: 'active' },
    { id: '7', name: 'Ethan Johnson', email: 'ethan@lincoln.edu', grade: '10th', courses: 5, avgGrade: 85.6, attendance: 93.8, status: 'active' },
    { id: '8', name: 'Olivia Davis', email: 'olivia@lincoln.edu', grade: '9th', courses: 4, avgGrade: 88.4, attendance: 95.2, status: 'active' },
];
export const mockExams = [
    { id: '1', title: 'Midterm - Advanced Math', course: 'Advanced Mathematics', type: 'mcq', date: '2026-02-15', duration: 90, questions: 40, status: 'upcoming', avgScore: null },
    { id: '2', title: 'Quiz 3 - Physics', course: 'Physics Fundamentals', type: 'mcq', date: '2026-02-10', duration: 30, questions: 15, status: 'completed', avgScore: 78 },
    { id: '3', title: 'Essay - Shakespeare Analysis', course: 'English Literature', type: 'essay', date: '2026-02-12', duration: 60, questions: 3, status: 'grading', avgScore: null },
    { id: '4', title: 'Final - CS101', course: 'Computer Science 101', type: 'mcq', date: '2026-03-01', duration: 120, questions: 60, status: 'upcoming', avgScore: null },
];
export const mockAttendance = [
    { date: '2026-02-03', present: 38, absent: 4, total: 42, rate: 90.5 },
    { date: '2026-02-04', present: 40, absent: 2, total: 42, rate: 95.2 },
    { date: '2026-02-05', present: 41, absent: 1, total: 42, rate: 97.6 },
    { date: '2026-02-06', present: 39, absent: 3, total: 42, rate: 92.9 },
    { date: '2026-02-07', present: 42, absent: 0, total: 42, rate: 100 },
];
export const mockPayments = [
    { id: '1', student: 'Alex Rivera', course: 'Physics Fundamentals', amount: 49.99, date: '2026-02-01', method: 'card', status: 'completed' },
    { id: '2', student: 'Jessica Park', course: 'Computer Science 101', amount: 79.99, date: '2026-02-02', method: 'card', status: 'completed' },
    { id: '3', student: 'Michael Brown', course: 'Biology Lab', amount: 59.99, date: '2026-02-03', method: 'offline', status: 'pending' },
    { id: '4', student: 'Emma Wilson', course: 'Physics Fundamentals', amount: 49.99, date: '2026-02-04', method: 'card', status: 'completed' },
    { id: '5', student: 'Daniel Lee', course: 'Computer Science 101', amount: 79.99, date: '2026-02-05', method: 'card', status: 'refunded' },
];
export const mockZoomClasses = [
    { id: '1', title: 'Math - Calculus Review', course: 'Advanced Mathematics', teacher: 'Dr. James Carter', date: '2026-02-10', time: '09:00 AM', duration: 60, students: 42, status: 'scheduled', meetingId: '123-456-789' },
    { id: '2', title: 'Physics Lab Demo', course: 'Physics Fundamentals', teacher: 'Prof. Emily Stone', date: '2026-02-10', time: '11:00 AM', duration: 45, students: 38, status: 'live', meetingId: '234-567-890' },
    { id: '3', title: 'Literature Discussion', course: 'English Literature', teacher: 'Ms. Diana Ross', date: '2026-02-09', time: '02:00 PM', duration: 50, students: 35, status: 'completed', meetingId: '345-678-901', recordingUrl: '#' },
];
export const mockActivities = [
    { id: '1', action: 'New student enrolled', detail: 'Alex Rivera joined Advanced Mathematics', time: '2 min ago', type: 'enrollment' },
    { id: '2', action: 'Exam submitted', detail: 'Jessica Park completed Physics Quiz 3', time: '15 min ago', type: 'exam' },
    { id: '3', action: 'Payment received', detail: '$79.99 from Michael Brown for CS101', time: '1 hour ago', type: 'payment' },
    { id: '4', action: 'Course updated', detail: 'Dr. Carter added new lesson to Math', time: '2 hours ago', type: 'course' },
    { id: '5', action: 'Attendance marked', detail: 'English Literature - 35/35 present', time: '3 hours ago', type: 'attendance' },
];
export const mockSchedule = [
    { id: '1', title: 'Advanced Math', day: 'Monday', time: '09:00 - 10:30', room: 'Room 201', teacher: 'Dr. James Carter', color: 'hsl(217 91% 60%)' },
    { id: '2', title: 'Physics Lab', day: 'Monday', time: '11:00 - 12:30', room: 'Lab 3', teacher: 'Prof. Emily Stone', color: 'hsl(262 83% 58%)' },
    { id: '3', title: 'English Lit', day: 'Tuesday', time: '09:00 - 10:30', room: 'Room 105', teacher: 'Ms. Diana Ross', color: 'hsl(142 71% 45%)' },
    { id: '4', title: 'CS 101', day: 'Tuesday', time: '14:00 - 15:30', room: 'Computer Lab', teacher: 'Mr. Alan Turing', color: 'hsl(38 92% 50%)' },
    { id: '5', title: 'World History', day: 'Wednesday', time: '10:00 - 11:30', room: 'Room 302', teacher: 'Dr. Maria Lopez', color: 'hsl(0 84% 60%)' },
    { id: '6', title: 'Biology Lab', day: 'Thursday', time: '13:00 - 14:30', room: 'Lab 1', teacher: 'Dr. Sarah Kim', color: 'hsl(180 60% 45%)' },
];

