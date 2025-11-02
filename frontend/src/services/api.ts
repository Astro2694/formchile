import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'learner';
}

export interface Course {
  id: number;
  identifier: string;
  title: string;
  description: string;
  version: string;
  duration: number;
  sectionCount: number;
  scormData: string;
}

export interface Progress {
  id: number;
  userId: number;
  courseId: number;
  completion: number;
  score: number;
  timeSpent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessed: string;
  user?: User;
  course?: Course;
}

export interface Activity {
  id: number;
  userId: number;
  courseId: number;
  activityType: string;
  details: string;
  timestamp: string;
  user?: User;
  course?: Course;
}

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string, role?: string) =>
    api.post('/auth/register', { username, email, password, role }),
};

export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const coursesAPI = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: Partial<Course>) => api.post('/courses', data),
  update: (id: number, data: Partial<Course>) => api.put(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

export const progressAPI = {
  getAll: (userId?: number, courseId?: number) =>
    api.get<Progress[]>('/progress', { params: { userId, courseId } }),
  getById: (id: number) => api.get<Progress>(`/progress/${id}`),
  update: (data: Partial<Progress>) => api.post('/progress', data),
  delete: (id: number) => api.delete(`/progress/${id}`),
};

export const reportsAPI = {
  getOverview: () => api.get('/reports/overview'),
  getCourseReport: (courseId: number) => api.get(`/reports/course/${courseId}`),
  getUserReport: (userId: number) => api.get(`/reports/user/${userId}`),
  getActivities: (limit?: number, userId?: number, courseId?: number) =>
    api.get<Activity[]>('/reports/activities', { params: { limit, userId, courseId } }),
};

export default api;
