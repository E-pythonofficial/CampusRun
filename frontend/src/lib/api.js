import axios from 'axios';

// Pull the base URL from your .env file
// If you are testing on phone, set VITE_API_URL=http://192.168.1.XX:5000 in .env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});
  
// Automatically attach the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusrun_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;