import axios from 'axios';

/*
====================================================
  🔥 LPU COIN - ULTIMATE API CONFIGURATION
====================================================
*/

// 1. URLs Define karein
const PROD_URL = 'https://lpu-coin-backend.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

// 2. Smart Detection (Bulletproof logic)
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_URL;
    }
  }
  return PROD_URL;
};

const API_URL = getBaseURL();

// Debugging ke liye (Console mein dikhega ki kaunsa backend use ho raha hai)
console.log(`🚀 Nexus System: Connecting to Backend at ${API_URL}`);

// 3. Axios Instance Create karein
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // ⏳ 60 seconds (Render free tier takes time to wake up)
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔐 Request Interceptor: JWT Token automatically har request mein jud jayega
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
   1️⃣ AUTHENTICATION APIs
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

/* ====================================================
   2️⃣ WALLET & TRANSACTIONS APIs
==================================================== */
export const walletAPI = {
  addMoney: (amount) => api.post('/wallet/add-money', { amount }),
  getBalance: () => api.get('/wallet/balance'),
  processPayment: (merchantId, amount) => api.post('/wallet/pay', { merchantId, amount }),
  getTransactions: () => api.get('/wallet/transactions'),
};

/* ====================================================
   3️⃣ MERCHANT TERMINAL APIs
==================================================== */
export const merchantAPI = {
  generateQRCode: () => api.get('/merchant/qr-code'),
  requestSettlement: (amount) => api.post('/merchant/settlement-request', { amount }),
  getDashboard: () => api.get('/merchant/dashboard'),
};

/* ====================================================
   4️⃣ SYSTEM ADMIN APIs
==================================================== */
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getSettlementRequests: () => api.get('/admin/settlements'),
  approveSettlement: (id) => api.post(`/admin/settlements/${id}/approve`),
  rejectSettlement: (id, reason) => api.post(`/admin/settlements/${id}/reject`, { reason }),
};

/* ====================================================
   5️⃣ CAMPUS MESS APIs
==================================================== */
export const messAPI = {
  getMeals: () => api.get('/mess/all'),
  addMeal: (data) => api.post('/mess/add', data),
  deleteMeal: (id) => api.delete(`/mess/${id}`),
};

export default api;