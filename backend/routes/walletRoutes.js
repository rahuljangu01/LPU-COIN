import express from 'express';
import { addMoney, getWallet, processPayment, getTransactionHistory } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// यह लाइन सबसे ऊपर होनी चाहिए, इसके नीचे के सभी राउट्स अब सुरक्षित हैं
router.use(protect); 

router.post('/add-money', addMoney);
router.get('/balance', getWallet);
router.post('/pay', processPayment);
router.get('/transactions', getTransactionHistory);

export default router;