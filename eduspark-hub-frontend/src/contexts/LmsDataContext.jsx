import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '@/lib/api';

const LmsDataContext = createContext(null);

export const useLmsData = () => {
    const ctx = useContext(LmsDataContext);
    if (!ctx) throw new Error('useLmsData must be used within LmsDataProvider');
    return ctx;
};

export const LmsDataProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [payments, setPayments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [zoomClasses, setZoomClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [sms, setSms] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    // Refresh functions
    const refreshUsers = () => api.users.getAll().then(setUsers);
    const refreshCourses = () => api.courses.getAll().then(setCourses);
    const refreshLessons = () => api.lessons.getAll().then(setLessons);
    const refreshClasses = () => api.classes.getAll().then(setClasses);
    const refreshExams = () => api.exams.getAll().then(setExams);
    const refreshPayments = () => api.payments.getAll().then(setPayments);
    const refreshAttendance = () => api.attendance.getAll().then(setAttendance);
    const refreshZoom = () => api.zoomClasses.getAll().then(setZoomClasses);
    const refreshNotifications = () => api.notifications.getAll().then(setNotifications);
    const refreshSms = () => api.sms.getAll().then(setSms);
    const refreshAssignments = () => api.assignments.getAll().then(setAssignments);
    const refreshSubmissions = () => api.submissions.getAll().then(setSubmissions);

    // Initial Load - only load data if user is authenticated
    useEffect(() => {
        // Check if user has auth token
        const token = localStorage.getItem('eduflow-auth-token');

        // Only load data if authenticated
        if (token) {
            Promise.all([
                refreshUsers(),
                refreshCourses(),
                refreshLessons(),
                refreshClasses(),
                refreshExams(),
                refreshPayments(),
                refreshAttendance(),
                refreshZoom(),
                refreshNotifications(),
                refreshSms(),
                refreshAssignments(),
                refreshSubmissions()
            ]).catch(err => {
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

        upsertUser: async (user) => { await api.users.create(user); refreshUsers(); },
        deleteUser: async (id) => { await api.users.delete(id); refreshUsers(); },

        upsertCourse: async (course) => { await api.courses.create(course); refreshCourses(); },
        deleteCourse: async (id) => { await api.courses.delete(id); refreshCourses(); },

        upsertLesson: async (lesson) => { await api.lessons.create(lesson); refreshLessons(); },
        deleteLesson: async (id) => { await api.lessons.delete(id); refreshLessons(); },

        upsertClass: async (cls) => { await api.classes.create(cls); refreshClasses(); },
        deleteClass: async (id) => { await api.classes.delete(id); refreshClasses(); },

        upsertExam: async (exam) => { await api.exams.create(exam); refreshExams(); },
        deleteExam: async (id) => { await api.exams.delete(id); refreshExams(); },

        upsertPayment: async (payment) => { await api.payments.create(payment); refreshPayments(); },
        setPaymentStatus: async (paymentId, status, refundReason) => {
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                await api.payments.create({ ...payment, status, refundReason: status === 'refunded' ? refundReason : payment.refundReason });
                refreshPayments();
            }
        },
        attachDepositSlip: async (paymentId, filename) => {
            // In a real app we would upload the file. For now just updating metadata.
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                await api.payments.create({ ...payment, depositSlip: filename }); // Simplified
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
            await api.sms.create({ recipient: to, message: body, status: 'sent', sentAt: new Date().toISOString() });
            refreshSms();
            return { status: 'sent' }; // Compatible return
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

        // Mock remaining
        integrations: [],
        examAttempts: [],

        resetDemoData: () => console.log("Reset not supported in backend mode"),
        saveExamAttempt: () => { },
        toggleIntegration: () => { },
    };

    return <LmsDataContext.Provider value={value}>{children}</LmsDataContext.Provider>;
};
