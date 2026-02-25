import axios from 'axios';

/*
====================================================
  🔥 LPU COIN - BULLETPROOF API CONFIGURATION
====================================================
*/

// 1. URLs Define karein (Hardcoded for maximum reliability)
const PROD_URL = 'https://lpu-coin-backend.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

// 2. Smart Detection Logic
const getBaseURL = () => {
  try {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_URL;
    }
  } catch (e) {
    // If window is not defined (SSR or edge cases)
    return PROD_URL;
  }
  return PROD_URL;
};

const API_URL = getBaseURL();

// 3. Axios Instance Create
const api = axios.create({
  baseURL: API_URL, // Ab ye kabhi 'undefined' nahi hoga
  timeout: 60000,   // 60 seconds (Render ko jaghne ka waqt dein)
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔐 JWT Token Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ====================================================
   📦 API EXPORTS (Sare modules integrated)
==================================================== */

export const authAPI = {
  getFaceData: (email) => api.post('/auth/get-face-data', { email }),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  updateMe: (userData) => api.put('/auth/update-me', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getMerchantInfo: (id) => api.get(`/auth/merchant/${id}`),
};

export const walletAPI = {
  addMoney: (amount) => api.post('/wallet/add-money', { amount }),
  getBalance: () => api.get('/wallet/balance'),
  processPayment: (merchantId, amount) => api.post('/wallet/pay', { merchantId, amount }),
  getTransactions: () => api.get('/wallet/transactions'),
};

export const merchantAPI = {
  generateQRCode: () => api.get('/merchant/qr-code'),
  requestSettlement: (amount) => api.post('/merchant/settlement-request', { amount }),
  getDashboard: () => api.get('/merchant/dashboard'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getSettlementRequests: () => api.get('/admin/settlements'),
  approveSettlement: (id) => api.post(`/admin/settlements/${id}/approve`),
  rejectSettlement: (id, reason) => api.post(`/admin/settlements/${id}/reject`, { reason }),
};

export const messAPI = {
  getMeals: () => api.get('/mess/all'),
  addMeal: (data) => api.post('/mess/add', data),
  deleteMeal: (id) => api.delete(`/mess/${id}`),
};

export default api;