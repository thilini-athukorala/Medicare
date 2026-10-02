import axios from 'axios';

// All requests go to the Express backend
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatically attach the JWT token (if logged in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
