import User from '../models/User.js';
import SettlementRequest from '../models/SettlementRequest.js';
import Transaction from '../models/Transaction.js';
import QRCode from 'qrcode';

export const generateQRCode = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const merchant = await User.findById(merchantId);

    if (!merchant || merchant.role !== 'merchant') {
      return res.status(403).json({ message: 'Only merchants allowed' });
    }

    const qrData = JSON.stringify({ merchantId, type: 'payment' });
    const qrCode = await QRCode.toDataURL(qrData);

    res.json({ success: true, qrCode });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestSettlement = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { amount } = req.body;

    const merchant = await User.findById(merchantId);

    if (!merchant || merchant.role !== 'merchant')
      return res.status(403).json({ message: 'Only merchants allowed' });

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    if (merchant.walletBalance < amount)
      return res.status(400).json({ message: 'Insufficient balance' });

    const settlement = await SettlementRequest.create({
      merchantId,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'Settlement request submitted',
      settlement
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMerchantDashboard = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const merchant = await User.findById(merchantId);

    if (!merchant || merchant.role !== 'merchant')
      return res.status(403).json({ message: 'Unauthorized' });

    const transactions = await Transaction.find({
      toMerchantId: merchantId
    }).sort({ createdAt: -1 }).limit(10);

    const settlementRequests = await SettlementRequest.find({
      merchantId
    }).sort({ createdAt: -1 });

    const totalReceived = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      merchant: {
        name: merchant.name,
        walletBalance: merchant.walletBalance,
        totalReceived
      },
      recentTransactions: transactions,
      settlementRequests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};