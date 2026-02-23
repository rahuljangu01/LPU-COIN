import axios from 'axios';

/*
====================================================
  🔥 LPU COIN - BULLETPROOF API CONFIG
====================================================
*/

const PROD_URL = 'https://lpu-coin-backend.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

const API_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // ⏳ 60 seconds (Render free tier needs this)
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔐 Request Interceptor
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
   1️⃣ AUTH APIs
==================================================== */
export const authAPI = {
  getFaceData: (email) => api.post('/auth/get-face-data', { email }),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  updateMe: (userData) => api.put('/auth/update-me', userData),
  changePassword: (data) => api.put('/auth/change-password', data),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getMerchantInfo: (id) => api.get(`/auth/merchant/${id}`),
};

/* ====================================================
   2️⃣ WALLET APIs
==================================================== */
export const walletAPI = {
  addMoney: (amount) => api.post('/wallet/add-money', { amount }),
  getBalance: () => api.get('/wallet/balance'),
  processPayment: (merchantId, amount) => api.post('/wallet/pay', { merchantId, amount }),
  getTransactions: () => api.get('/wallet/transactions'),
};

/* ====================================================
   3️⃣ MERCHANT APIs
==================================================== */
export const merchantAPI = {
  generateQRCode: () => api.get('/merchant/qr-code'),
  requestSettlement: (amount) => api.post('/merchant/settlement-request', { amount }),
  getDashboard: () => api.get('/merchant/dashboard'),
};

/* ====================================================
   4️⃣ ADMIN APIs
==================================================== */
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getSettlementRequests: () => api.get('/admin/settlements'),
  approveSettlement: (id) => api.post(`/admin/settlements/${id}/approve`),
  rejectSettlement: (id, reason) => api.post(`/admin/settlements/${id}/reject`, { reason }),
};

/* ====================================================
   5️⃣ MESS APIs
==================================================== */
export const messAPI = {
  getMeals: () => api.get('/mess/all'),
  addMeal: (data) => api.post('/mess/add', data),
  deleteMeal: (id) => api.delete(`/mess/${id}`),
};

export default api;