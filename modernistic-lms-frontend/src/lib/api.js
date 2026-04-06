import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflow-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — but DON'T redirect on login/register pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/'];
      const currentPath = window.location.pathname;
      if (!publicPaths.some(p => currentPath.startsWith(p))) {
        localStorage.removeItem('eduflow-auth-token');
        localStorage.removeItem('eduflow-auth-user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Teachers ──────────────────────────────────────────────
export const teachers = {
  getAll: () => api.get('/teachers').then(r => r.data),
  getById: (id) => api.get(`/teachers/${id}`).then(r => r.data),
  create: (data) => api.post('/teachers', data).then(r => r.data),
  update: (id, data) => api.put(`/teachers/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// ── Students ──────────────────────────────────────────────
export const students = {
  getAll: () => api.get('/students').then(r => r.data),
  getById: (id) => api.get(`/students/${id}`).then(r => r.data),
  create: (data) => api.post('/students', data).then(r => r.data),
  update: (id, data) => api.put(`/students/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Keep 'users' as alias for teachers+students combined (for legacy components)
export const users = {
  getAll: () => Promise.all([
    api.get('/teachers').then(r => r.data.map(t => ({ ...t, role: 'teacher' }))),
    api.get('/students').then(r => r.data.map(s => ({ ...s, role: 'student' }))),
  ]).then(([t, s]) => [...t, ...s]),
  getById: (id, role) => {
    const endpoint = role === 'teacher' ? '/teachers' : '/students';
    return api.get(`${endpoint}/${id}`).then(r => r.data);
  },
  create: (data) => {
    // Route to correct endpoint based on role
    if (data.role === 'teacher') {
      if (data.id) {
        // Update existing teacher via PUT
        return api.put(`/teachers/${data.id}`, data).then(r => r.data);
      }
      return api.post('/teachers', data).then(r => r.data);
    } else {
      if (data.id) {
        // Update existing student via PUT
        return api.put(`/students/${data.id}`, data).then(r => r.data);
      }
      return api.post('/students', data).then(r => r.data);
    }
  },
  delete: (id, role) => {
    const endpoint = role === 'teacher' ? '/teachers' : '/students';
    return api.delete(`${endpoint}/${id}`);
  },
};

// ── Courses ───────────────────────────────────────────────
export const courses = {
  getAll: () => api.get('/courses').then(r => r.data),
  getById: (id) => api.get(`/courses/${id}`).then(r => r.data),
  create: (data) => api.post('/courses', data).then(r => r.data),
  update: (id, data) => api.put(`/courses/${id}`, data).then(r => r.data),
  autoCreateZoomMeeting: (id) => api.post(`/courses/${id}/zoom/auto-create`).then(r => r.data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// ── Lessons ───────────────────────────────────────────────
export const lessons = {
  getAll: () => api.get('/lessons').then(r => r.data),
  getById: (id) => api.get(`/lessons/${id}`).then(r => r.data),
  create: (data) => api.post('/lessons', data).then(r => r.data),
  update: (id, data) => api.put(`/lessons/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

// ── Classes ───────────────────────────────────────────────
export const classes = {
  getAll: () => api.get('/classes').then(r => r.data),
  getById: (id) => api.get(`/classes/${id}`).then(r => r.data),
  create: (data) => api.post('/classes', data).then(r => r.data),
  update: (id, data) => api.put(`/classes/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// ── Class Enrollments ─────────────────────────────────────
export const classEnrollments = {
  getAll: () => api.get('/class-enrollments').then(r => r.data),
  getByStudent: (studentId) => api.get(`/class-enrollments/student/${studentId}`).then(r => r.data),
  getByClass: (classId) => api.get(`/class-enrollments/class/${classId}`).then(r => r.data),
  check: (studentId, classId) => api.get('/class-enrollments/check', { params: { studentId, classId } }).then(r => r.data),
  enroll: (data) => api.post('/class-enrollments', data).then(r => r.data),
  delete: (id) => api.delete(`/class-enrollments/${id}`),
};

// ── Exams ──────────────────────────────────────────────────
export const exams = {
  getAll: () => api.get('/exams').then(r => r.data),
  getById: (id) => api.get(`/exams/${id}`).then(r => r.data),
  create: (data) => {
    // Determine if it's an update (has a numeric ID and not a local 'paper_' ID)
    if (data.id && typeof data.id === 'number' || (typeof data.id === 'string' && !data.id.startsWith('paper_'))) {
      return api.put(`/exams/${data.id}`, data).then(r => r.data);
    }
    // New exam
    // Remove the fake ID so backend creates it
    if(data.id && String(data.id).startsWith('paper_')) {
        delete data.id;
    }
    return api.post('/exams', data).then(r => r.data);
  },
  update: (id, data) => api.put(`/exams/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/exams/${id}`),
};

// ── Exam Submissions (Student Answers / Lecturer Review) ──
export const examSubmissions = {
  getAll: () => api.get('/exam-submissions').then(r => r.data),
  getByExam: (examId) => api.get(`/exam-submissions/exam/${examId}`).then(r => r.data),
  create: (data) => api.post('/exam-submissions', data).then(r => r.data),
  review: (id, data) => api.put(`/exam-submissions/${id}/review`, data).then(r => r.data),
};

// ── SMS ───────────────────────────────────────────────────
export const sms = {
  getAll: () => api.get('/sms').then(r => r.data.map(item => ({
    ...item,
    to: item.mobile,
    body: item.message || item.smsBody,
    createdAt: item.dateTime
  }))),
  create: (data) => api.post('/sms', data).then(r => r.data),
  delete: (id) => api.delete(`/sms/${id}`),
};

// ── Stubs for removed endpoints (return empty arrays safely) ──
export const payments = {
  getAll: () => api.get('/payments').then(r => r.data),
  create: (data) => api.post('/payments', data).then(r => r.data),
  update: (id, data) => api.put(`/payments/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/payments/${id}`),
};
export const attendance = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
};
export const zoomClasses = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
  delete: () => Promise.resolve(),
};
export const notifications = {
  getAll: () => {
    const data = localStorage.getItem('mock_notifications');
    return Promise.resolve(data ? JSON.parse(data) : []);
  },
  create: (n) => {
    const data = localStorage.getItem('mock_notifications');
    const list = data ? JSON.parse(data) : [];
    const idx = list.findIndex(x => x.id === n.id);
    if(idx >= 0) list[idx] = n; else list.unshift(n);
    localStorage.setItem('mock_notifications', JSON.stringify(list));
    return Promise.resolve(n);
  },
};
export const assignments = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
  delete: () => Promise.resolve(),
};
export const submissions = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
};

// ── File Uploads (S3) ─────────────────────────────────────
export const files = {
  upload: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  resolveByName: (fileName, folder = 'general') => api.get('/files/resolve', {
    params: { fileName, folder },
  }).then(r => r.data),
  delete: (url) => api.delete('/files/delete', { params: { url } }).then(r => r.data),
};

// ── Auth ──────────────────────────────────────────────────
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  registerStudent: (data) => api.post('/auth/register/student', data).then(r => r.data),
  registerTeacher: (data) => api.post('/auth/register/teacher', data).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};

// ── Science AI Analyst ────────────────────────────────────
export const scienceAnalyst = {
  analyze: (formData) => api.post('/science-analyst/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  getResults: () => api.get('/science-analyst/results').then(r => r.data),
  getResult: (id) => api.get(`/science-analyst/results/${id}`).then(r => r.data),
  getTopics: (grade, subject) => {
    let url = '/science-analyst/topics';
    const params = [];
    if (grade) params.push(`grade=${grade}`);
    if (subject) params.push(`subject=${subject}`);
    if (params.length) url += '?' + params.join('&');
    return api.get(url).then(r => r.data);
  },
  health: () => api.get('/science-analyst/health').then(r => r.data),
  deleteResult: (id) => api.delete(`/science-analyst/results/${id}`),
};

export default api;

