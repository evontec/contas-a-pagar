import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Accounts API
export const accountsAPI = {
  // Get dashboard data
  getDashboard: () => api.get('/accounts/dashboard'),
  
  // Get all accounts with filters
  getAccounts: (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });
    
    return api.get(`/accounts?${params.toString()}`);
  },
  
  // Create new account
  createAccount: (accountData) => api.post('/accounts', accountData),
  
  // Update account
  updateAccount: (id, accountData) => api.put(`/accounts/${id}`, accountData),
  
  // Delete account
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
};

export default api;