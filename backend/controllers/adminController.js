import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SettlementRequest from '../models/SettlementRequest.js';
import SystemWallet from '../models/SystemWallet.js';

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

export const approveSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await SettlementRequest.findById(settlementId);

    if (!settlement || settlement.status !== 'PENDING')
      return res.status(400).json({ message: 'Invalid request' });

    const merchant = await User.findById(settlement.merchantId);

    if (!merchant || merchant.walletBalance < settlement.amount)
      return res.status(400).json({ message: 'Insufficient merchant balance' });

    // Deduct LP from merchant
    merchant.walletBalance -= settlement.amount;
    await merchant.save();

    // Burn LP from system
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

    res.json({ success: true, message: 'Settlement Rejected' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};