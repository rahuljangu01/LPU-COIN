import express from 'express';
import {
  getAllUsers,
  getAllTransactions,
  getSettlementRequests,
  approveSettlement,
  rejectSettlement,
  getSystemWallet,
  getAdminDashboard
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/settlements', getSettlementRequests);
router.post('/settlements/:settlementId/approve', approveSettlement);
router.post('/settlements/:settlementId/reject', rejectSettlement);
router.get('/system-wallet', getSystemWallet);
router.get('/dashboard', getAdminDashboard);

export default router;
