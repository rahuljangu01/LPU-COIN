import express from 'express';
import { 
  register, login, getMe, updateMe, sendOTP, 
  checkEmail, forgotPassword, getFaceData, getMerchantInfo 
} from '../controllers/authController.js'; 
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ये Public Routes हैं (लॉगिन से पहले के)
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP); 
router.post('/check-email', checkEmail);
router.post('/forgot-password', forgotPassword); // <--- इसे चेक करें
router.post('/get-face-data', getFaceData); 
router.get('/merchant/:id', getMerchantInfo);

// Protected Routes
router.get('/me', protect, getMe);
router.put('/update-me', protect, updateMe);

export default router;