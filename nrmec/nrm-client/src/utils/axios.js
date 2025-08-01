import axios from 'axios';

// Create an axios instance with the base URL and default headers
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token in each request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from local storage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) errors - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
