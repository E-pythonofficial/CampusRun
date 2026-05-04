// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // ← must match your backend URL
});

// ✅ This interceptor attaches the token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusrun_token'); // ← must match your key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;