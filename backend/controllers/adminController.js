import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SettlementRequest from '../models/SettlementRequest.js';
import SystemWallet from '../models/SystemWallet.js';


// =============================
// 🔹 GET ALL USERS
// =============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 GET ALL TRANSACTIONS
// =============================
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email collegeId')
      .populate('merchantId', 'name email collegeId')
      .sort({ createdAt: -1 });

    res.json({ success: true, transactions });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 GET SYSTEM WALLET
// =============================
export const getSystemWallet = async (req, res) => {
  try {
    let systemWallet = await SystemWallet.findOne();

    if (!systemWallet) {
      systemWallet = await SystemWallet.create({
        totalCashReserve: 0,
        totalCoinsInSystem: 0
      });
    }

    res.json({ success: true, systemWallet });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 ADMIN DASHBOARD
// =============================
export const getAdminDashboard = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: 'user' });
    const merchantsCount = await User.countDocuments({ role: 'merchant' });
    const totalTrans = await Transaction.countDocuments();
    const pendingSettlements = await SettlementRequest.countDocuments({ status: 'PENDING' });

    let systemWallet = await SystemWallet.findOne();
    if (!systemWallet) {
      systemWallet = await SystemWallet.create({
        totalCashReserve: 0,
        totalCoinsInSystem: 0
      });
    }

    res.json({
      success: true,
      dashboard: {
        totalUsers: usersCount,
        totalMerchants: merchantsCount,
        totalTransactions: totalTrans,
        pendingSettlements,
        systemWallet
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 GET SETTLEMENT REQUESTS
// =============================
export const getSettlementRequests = async (req, res) => {
  try {
    const requests = await SettlementRequest
      .find()
      .populate('merchantId', 'name email collegeId walletBalance')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 APPROVE SETTLEMENT
// =============================
export const approveSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await SettlementRequest.findById(settlementId);

    if (!settlement || settlement.status !== 'PENDING')
      return res.status(400).json({ message: 'Invalid request' });

    const merchant = await User.findById(settlement.merchantId);

    if (!merchant || merchant.walletBalance < settlement.amount)
      return res.status(400).json({ message: 'Insufficient merchant balance' });

    merchant.walletBalance -= settlement.amount;
    await merchant.save();

    const systemWallet = await SystemWallet.findOne();
    if (systemWallet) {
      systemWallet.totalCashReserve -= settlement.amount;
      systemWallet.totalCoinsInSystem -= settlement.amount;
      await systemWallet.save();
    }

    settlement.status = 'APPROVED';
    settlement.approvedBy = req.user.id;
    settlement.approvedAt = new Date();
    await settlement.save();

    res.json({ success: true, message: 'Settlement Approved ✅' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// 🔹 REJECT SETTLEMENT
// =============================
export const rejectSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const { reason } = req.body;

    await SettlementRequest.findByIdAndUpdate(settlementId, {
      status: 'REJECTED',
      rejectionReason: reason || 'Policy violation',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    res.json({ success: true, message: 'Settlement Rejected ❌' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};