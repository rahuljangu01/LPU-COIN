import axios from 'axios';

/*
====================================================
  🔥 LPU COIN - PRODUCTION READY API CONFIG
====================================================
*/

// 🌍 Production Backend (Render)
const PROD_URL = 'https://lpu-coin-backend.onrender.com/api';

// 💻 Local Backend
const LOCAL_URL = 'http://localhost:5000/api';

// 🧠 Smart Detection: Automatically switches based on environment
const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost ? LOCAL_URL : PROD_URL;

// 🚀 Axios Instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// 🔐 Request Interceptor (Attach JWT Automatically)
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
  // --- Naye Centralized Endpoints ---
  getFaceData: (email) => api.post('/auth/get-face-data', { email }),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  
  // --- Profile & Management ---
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
  getAllUsers: () => api.get('/admin/users'),
  getAllTransactions: () => api.get('/admin/transactions'),
  getSettlementRequests: () => api.get('/admin/settlements'),
  approveSettlement: (settlementId) => api.post(`/admin/settlements/${settlementId}/approve`),
  rejectSettlement: (settlementId, reason) => api.post(`/admin/settlements/${settlementId}/reject`, { reason }),
  getSystemWallet: () => api.get('/admin/system-wallet'),
  getDashboard: () => api.get('/admin/dashboard'),
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