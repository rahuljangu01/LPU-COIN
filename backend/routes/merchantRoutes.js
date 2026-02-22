import express from 'express';
import { 
  generateQRCode, 
  requestSettlement, 
  getMerchantDashboard 
} from '../controllers/merchantController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// 🔐 Login Required
router.use(protect);

// 🔒 Only Merchant Allowed
router.use(authorize('merchant'));

router.get('/qr-code', generateQRCode);
router.post('/settlement-request', requestSettlement);
router.get('/dashboard', getMerchantDashboard);

export default router;