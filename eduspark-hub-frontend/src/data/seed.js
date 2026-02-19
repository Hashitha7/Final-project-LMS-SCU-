import { uid } from '@/lib/storage';
const in3Days = () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
export const createSeedDb = () => {
    // Users
    const admin = { id: uid(), name: 'Sarah Williams', email: 'admin@lincoln.edu', role: 'admin', school: 'Lincoln Academy' };
    const teacher1 = { id: uid(), name: 'Dr. James Carter', email: 'carter@lincoln.edu', role: 'teacher', school: 'Lincoln Academy' };
    const teacher2 = { id: uid(), name: 'Prof. Emily Stone', email: 'stone@lincoln.edu', role: 'teacher', school: 'Lincoln Academy' };
    const student1 = { id: uid(), name: 'Alex Rivera', email: 'alex@lincoln.edu', mobile: '+1 555 100 200', role: 'student', school: 'Lincoln Academy', subscription: { plan: 'trial', trialEndsAt: in3Days() } };
    const student2 = { id: uid(), name: 'Jessica Park', email: 'jessica@lincoln.edu', mobile: '+1 555 300 400', role: 'student', school: 'Lincoln Academy', subscription: { plan: 'free' } };
    const users = [admin, teacher1, teacher2, student1, student2];
    // Courses
    const courses = [
        {
            id: uid(),
            title: 'Advanced Mathematics',
            description: 'A modern, problem-first approach to calculus & trigonometry.',
            teacherId: teacher1.id,
            grade: '10th',
            status: 'active',
            price: 0,
            image: '📐',
            tags: ['free', 'stem'],
        },
        {
            id: uid(),
            title: 'Physics Fundamentals',
            description: 'Mechanics, waves, and labs with weekly quizzes.',
            teacherId: teacher2.id,
            grade: '11th',
            status: 'active',
            price: 49.99,
            image: '⚛️',
            tags: ['paid', 'stem'],
        },
        {
            id: uid(),
            title: 'English Literature',
            description: 'Short stories, poetry, and writing workshops.',
            teacherId: teacher1.id,
            grade: '9th',
            status: 'active',
            price: 0,
            image: '📚',
            tags: ['free', 'language'],
        },
    ];
    // Classes
    const classes = [
        {
            id: uid(),
            name: 'Grade 10 - A',
            grade: '10th',
            status: 'active',
            teacherId: teacher1.id,
            courseIds: [courses[0].id],
            studentIds: [student1.id],
        },
        {
            id: uid(),
            name: 'Grade 11 - Physics',
            grade: '11th',
            status: 'active',
            teacherId: teacher2.id,
            courseIds: [courses[1].id],
            studentIds: [student1.id, student2.id],
        },
    ];
    // Lessons & resources (Video + PDF)
    const lessons = [
        {
            id: uid(),
            courseId: courses[0].id,
            title: 'Unit Circle Basics',
            summary: 'Angles, radians, and the unit circle map.',
            order: 1,
            resources: [
                { id: uid(), type: 'video', title: 'Unit Circle Walkthrough', url: 'https://example.com/video/unit-circle', premium: false },
                { id: uid(), type: 'pdf', title: 'Practice Sheet (PDF)', url: 'https://example.com/pdf/unit-circle.pdf', premium: false },
            ],
        },
        {
            id: uid(),
            courseId: courses[1].id,
            title: 'Newton\'s Laws',
            summary: 'Forces, mass, acceleration and common misconceptions.',
            order: 1,
            resources: [
                { id: uid(), type: 'video', title: 'Lab Demo (Premium Video)', url: 'https://example.com/video/newton', premium: true },
                { id: uid(), type: 'pdf', title: 'Worksheet (PDF)', url: 'https://example.com/pdf/newton.pdf', premium: true },
            ],
        },
    ];
    // Assignments & submissions (grading scheme + feedback)
    const assignments = [
        {
            id: uid(),
            courseId: courses[0].id,
            title: 'Trigonometry Practice Set 1',
            instructions: 'Solve the problems and upload your final answers.',
            dueDate: '2026-02-20',
            maxPoints: 100,
            attachments: [{ id: uid(), type: 'pdf', title: 'Problem Set PDF', url: 'https://example.com/pdf/trig-set-1.pdf', premium: false }],
        },
    ];
    const submissions = [
        {
            id: uid(),
            assignmentId: assignments[0].id,
            studentId: student1.id,
            submittedAt: new Date().toISOString(),
            content: 'Attached my solutions. Please review.',
            grade: 92,
            feedback: 'Great work. Minor mistake in Q4 sign.',
        },
    ];
    // Exams (MCQ + Essay) + integrity settings
    const exams = [
        {
            id: uid(),
            courseId: courses[0].id,
            title: 'Math Midterm',
            date: '2026-02-15',
            durationMin: 90,
            status: 'upcoming',
            integrity: {
                shuffleQuestions: true,
                shuffleOptions: true,
                fullscreenRequired: true,
                disableCopyPaste: true,
                warnOnTabChange: true,
            },
            questions: [
                { id: uid(), type: 'mcq', prompt: 'sin(π/2) equals?', options: ['0', '1', '-1', 'π/2'], correctIndex: 1, points: 2 },
                { id: uid(), type: 'essay', prompt: 'Explain why radians are more natural than degrees.', points: 8 },
            ],
        },
    ];
    // Payments: online + offline (deposit slips can be attached in UI)
    const payments = [
        {
            id: uid(),
            studentId: student1.id,
            courseId: courses[1].id,
            amount: 49.99,
            date: '2026-02-01',
            method: 'card',
            status: 'completed',
        },
        {
            id: uid(),
            studentId: student2.id,
            courseId: courses[1].id,
            amount: 49.99,
            date: '2026-02-03',
            method: 'offline',
            status: 'pending',
        },
    ];
    const notifications = [
        {
            id: uid(),
            title: 'Welcome to EduSpark Hub',
            message: 'Check your course dashboard for lessons, assignments and exams.',
            targetRoles: ['student', 'teacher', 'admin'],
            createdAt: new Date().toISOString(),
            readBy: [],
        },
    ];
    const sms = [];
    const integrations = [
        { id: uid(), type: 'zoom', connected: false, updatedAt: new Date().toISOString() },
        { id: uid(), type: 'msteams', connected: false, updatedAt: new Date().toISOString() },
        { id: uid(), type: 'payments', connected: false, provider: 'stripe', updatedAt: new Date().toISOString() },
    ];
    return {
        version: 1,
        users,
        courses,
        classes,
        lessons,
        assignments,
        submissions,
        exams,
        examAttempts: [],
        attendanceSessions: [],
        payments,
        notifications,
        sms,
        integrations,
    };
};
