import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios Request Interceptor
// Validates Requirement 4.1: Injecting JWT tokens in every outgoing backend API call
api.interceptors.request.use(
  (config) => {
    // In a real app, token retrieval would come from Keycloak/cookie/localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
