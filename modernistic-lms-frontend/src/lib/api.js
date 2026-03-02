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

// ── Exams (backed by Quiz entity) ─────────────────────────
export const exams = {
  getAll: () => api.get('/exams').then(r => r.data),
  getById: (id) => api.get(`/exams/${id}`).then(r => r.data),
  create: (data) => api.post('/exams', data).then(r => r.data),
  update: (id, data) => api.put(`/exams/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/exams/${id}`),
};

// ── SMS ───────────────────────────────────────────────────
export const sms = {
  getAll: () => api.get('/sms').then(r => r.data),
  create: (data) => api.post('/sms', data).then(r => r.data),
  delete: (id) => api.delete(`/sms/${id}`),
};

// ── Stubs for removed endpoints (return empty arrays safely) ──
export const payments = {
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
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
  getAll: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
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

// ── Auth ──────────────────────────────────────────────────
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
  registerStudent: (data) => api.post('/auth/register/student', data).then(r => r.data),
  registerTeacher: (data) => api.post('/auth/register/teacher', data).then(r => r.data),
  me: () => api.get('/users/me').then(r => r.data),
};

export default api;

