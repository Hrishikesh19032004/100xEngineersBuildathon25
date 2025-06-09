import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
export const contractApi = {
    createContract: (contractData) => api.post(`${process.env.REACT_APP_API_URL}/api/contracts`, contractData),
    getContract: (contractId) => api.get(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}`),
    signContract: (contractId, signature) => api.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/sign`, { signature }),
    getContracts: () => api.get(`${process.env.REACT_APP_API_URL}/api/contracts`)
  };
  

export default api;