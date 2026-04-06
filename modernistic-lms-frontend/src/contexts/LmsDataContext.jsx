import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '@/lib/api';

const fallbackContext = {
    users: [],
    courses: [],
    lessons: [],
    classes: [],
    exams: [],
    payments: [],
    attendanceSessions: [],
    zoomClasses: [],
    notifications: [],
    sms: [],
    assignments: [],
    submissions: [],
    upsertUser: async () => { },
    deleteUser: async () => { },
    upsertCourse: async () => { },
    createCourseZoomMeeting: async () => ({}),
    deleteCourse: async () => { },
    upsertLesson: async () => { },
    deleteLesson: async () => { },
    upsertClass: async () => { },
    deleteClass: async () => { },
    upsertExam: async () => { },
    deleteExam: async () => { },
    upsertPayment: async () => { },
    setPaymentStatus: async () => { },
    attachDepositSlip: async () => { },
    upsertAttendanceSession: async () => { },
    upsertZoomClass: async () => { },
    deleteZoomClass: async () => { },
    upsertNotification: async () => { },
    markNotificationRead: async () => { },
    sendSms: async () => ({ status: 'failed' }),
    upsertAssignment: async () => { },
    deleteAssignment: async () => { },
    submitAssignment: async () => ({}),
    gradeSubmission: async () => { },
    enrollInClass: async () => ({}),
    unenrollFromClass: async () => {},
    classEnrollments: [],
    examAttempts: [],
    resetDemoData: () => { },
    saveExamAttempt: async () => ({}),
    reviewExamAttempt: async () => ({}),
    refreshExamAttempts: async () => {},
    toggleIntegration: () => { },
};

const LmsDataContext = createContext(fallbackContext);

export const useLmsData = () => {
    const ctx = useContext(LmsDataContext);
    return ctx || fallbackContext;
};

export const LmsDataProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [examAttempts, setExamAttempts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [zoomClasses, setZoomClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [sms, setSms] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [classEnrollments, setClassEnrollments] = useState([]);

    // Refresh functions
    const refreshUsers = () => api.users.getAll().then(setUsers).catch(() => setUsers([]));
    const refreshCourses = () => api.courses.getAll().then(setCourses);
    const refreshLessons = () => api.lessons.getAll().then(data => {
        setLessons(data.map(l => {
            try { return { ...l, resources: l.resourcesJson ? JSON.parse(l.resourcesJson) : [] }; }
            catch (e) { return { ...l, resources: [] }; }
        }));
    });
    const refreshClasses = () => api.classes.getAll().then(setClasses);
    const refreshExams = () => api.exams.getAll().then(setExams);
    const refreshExamAttempts = () => api.examSubmissions.getAll().then(setExamAttempts).catch(() => setExamAttempts([]));
    const refreshPayments = () => api.payments.getAll().then(setPayments);
    const refreshAttendance = () => api.attendance.getAll().then(setAttendance);
    const refreshZoom = () => api.zoomClasses.getAll().then(setZoomClasses);
    const refreshNotifications = () => api.notifications.getAll().then(setNotifications);
    const refreshSms = () => api.sms.getAll().then(setSms);
    const refreshAssignments = () => api.assignments.getAll().then(setAssignments);
    const refreshSubmissions = () => api.submissions.getAll().then(setSubmissions);
    const refreshClassEnrollments = () => api.classEnrollments.getAll().then(setClassEnrollments);

    // Initial Load - only load data if user is authenticated
    useEffect(() => {
        // Check if user has auth token
        const token = localStorage.getItem('eduflow-auth-token');
        let role = '';
        try {
            const rawUser = localStorage.getItem('eduflow-auth-user');
            role = rawUser ? (JSON.parse(rawUser)?.role || '').toLowerCase() : '';
        } catch {
            role = '';
        }

        // Only load data if authenticated
        if (token) {
            const tasks = [
                refreshCourses(),
                refreshLessons(),
                refreshClasses(),
                refreshExams(),
                refreshExamAttempts(),
                refreshPayments(),
                refreshAttendance(),
                refreshZoom(),
                refreshNotifications(),
                refreshSms(),
                refreshAssignments(),
                refreshSubmissions(),
                refreshClassEnrollments()
            ];

            // /api/teachers requires institute authority in backend.
            if (role === 'admin' || role === 'institute') {
                tasks.unshift(refreshUsers());
            }

            Promise.all(tasks).catch(err => {
                console.error("Failed to load initial data", err);
                // If we get 401, the token is invalid - clear it
                if (err?.response?.status === 401) {
                    localStorage.removeItem('eduflow-auth-token');
                }
            });
        }
    }, []);

    const value = {
        users,
        courses,
        lessons,
        classes,
        exams,
        payments,
        attendanceSessions: attendance,
        zoomClasses,
        notifications,
        sms,
        assignments,
        submissions,
        classEnrollments,

        upsertUser: async (user) => { await api.users.create(user); refreshUsers(); },
        deleteUser: async (id, role) => { await api.users.delete(id, role); refreshUsers(); },

        upsertCourse: async (course) => {
            if (course.id) {
                await api.courses.update(course.id, course);
            } else {
                await api.courses.create(course);
            }
            refreshCourses();
        },
        createCourseZoomMeeting: async (courseId) => {
            const updated = await api.courses.autoCreateZoomMeeting(courseId);
            refreshCourses();
            return updated;
        },
        deleteCourse: async (id) => { await api.courses.delete(id); refreshCourses(); },

        upsertLesson: async (lesson) => {
            const payload = { ...lesson, resourcesJson: JSON.stringify(lesson.resources || []) };
            if (lesson.id) {
                await api.lessons.update(lesson.id, payload);
            } else {
                await api.lessons.create(payload);
            }
            refreshLessons();
        },
        deleteLesson: async (id) => { await api.lessons.delete(id); refreshLessons(); },

        upsertClass: async (cls) => { await api.classes.create(cls); refreshClasses(); },
        deleteClass: async (id) => { await api.classes.delete(id); refreshClasses(); },

        enrollInClass: async (studentId, classId, enrollType) => {
            const result = await api.classEnrollments.enroll({ studentId, classId, enrollType });
            refreshClassEnrollments();
            return result;
        },
        unenrollFromClass: async (enrollmentId) => {
            await api.classEnrollments.delete(enrollmentId);
            refreshClassEnrollments();
        },

        upsertExam: async (exam) => { await api.exams.create(exam); refreshExams(); },
        deleteExam: async (id) => { await api.exams.delete(id); refreshExams(); },

        upsertPayment: async (payment) => {
            if (payment.id) {
                await api.payments.update(payment.id, payment);
            } else {
                await api.payments.create(payment);
            }
            refreshPayments();
        },
        setPaymentStatus: async (paymentId, status, refundReason) => {
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                await api.payments.update(payment.id, {
                    ...payment,
                    status,
                    refundReason: status === 'refunded' ? refundReason : payment.refundReason
                });
                refreshPayments();
            }
        },
        attachDepositSlip: async (paymentId, filename) => {
            // In a real app we would upload the file. For now just updating metadata.
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                await api.payments.update(payment.id, { ...payment, depositSlip: filename });
                refreshPayments();
            }
        },

        upsertAttendanceSession: async (s) => { await api.attendance.create(s); refreshAttendance(); },

        upsertZoomClass: async (z) => { await api.zoomClasses.create(z); refreshZoom(); },
        deleteZoomClass: async (id) => { await api.zoomClasses.delete(id); refreshZoom(); },

        upsertNotification: async (n) => { await api.notifications.create(n); refreshNotifications(); },
        markNotificationRead: async (notificationId, userId) => {
            const n = notifications.find(x => x.id === notificationId);
            if (n) {
                const currentReadBy = n.readBy ? n.readBy.split(',') : [];
                if (!currentReadBy.includes(String(userId))) {
                    currentReadBy.push(String(userId));
                    await api.notifications.create({ ...n, readBy: currentReadBy.join(',') });
                    refreshNotifications();
                }
            }
        },

        sendSms: async (to, body) => {
            const payload = {
                mobile: to,
                message: body,
                smsBody: body,
                status: 'Delivered',
                typeOfSms: 'Campaign',
                institute: { id: 1 }
            };
            await api.sms.create(payload);
            refreshSms();
            return { status: 'sent' };
        },

        upsertAssignment: async (a) => { await api.assignments.create(a); refreshAssignments(); },
        deleteAssignment: async (id) => { await api.assignments.delete(id); refreshAssignments(); },

        submitAssignment: async (s) => {
            const created = await api.submissions.create(s);
            refreshSubmissions();
            return created;
        },

        gradeSubmission: async (id, grade, feedback) => {
            const s = submissions.find(x => x.id === id);
            if (s) {
                await api.submissions.create({ ...s, grade, feedback });
                refreshSubmissions();
            }
        },

        examAttempts,
        saveExamAttempt: async (attempt) => {
            const created = await api.examSubmissions.create(attempt);
            await refreshExamAttempts();
            return created;
        },
        reviewExamAttempt: async (id, reviewPayload) => {
            const updated = await api.examSubmissions.review(id, reviewPayload);
            await refreshExamAttempts();
            return updated;
        },
        refreshExamAttempts,
    };

    return <LmsDataContext.Provider value={value}>{children}</LmsDataContext.Provider>;
};

