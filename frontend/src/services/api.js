import axios from 'axios';

// 🌍 Production Backend (Render)
const PROD_URL = 'https://lpu-coin-backend.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

const API_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds (Render needs time to wake up)
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  getFaceData: (email) => api.post('/auth/get-face-data', { email }),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  updateMe: (userData) => api.put('/auth/update-me', userData),
  changePassword: (data) => api.put('/auth/change-password', data),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
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
  getAllUsers: () => api.get('/admin/users'),
  getAllTransactions: () => api.get('/admin/transactions'),
  getSettlementRequests: () => api.get('/admin/settlements'),
  approveSettlement: (settlementId) => api.post(`/admin/settlements/${settlementId}/approve`),
  rejectSettlement: (settlementId, reason) => api.post(`/admin/settlements/${settlementId}/reject`, { reason }),
  getSystemWallet: () => api.get('/admin/system-wallet'),
  getDashboard: () => api.get('/admin/dashboard'),
};

export const messAPI = {
  getMeals: () => api.get('/mess/all'),
  addMeal: (data) => api.post('/mess/add', data),
  deleteMeal: (id) => api.delete(`/mess/${id}`),
};

export default api;