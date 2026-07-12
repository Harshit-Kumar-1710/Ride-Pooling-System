import axios from 'axios';

// Automatically point to Vercel/Render API in production, or localhost in development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const getMe         = ()     => API.get('/auth/me');
export const getBalance    = ()     => API.get('/credits/balance');
export const getCreditHistory = ()  => API.get('/credits/history');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword  = (data) => API.post('/auth/reset-password', data);

export default API;