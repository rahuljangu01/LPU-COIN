import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import SystemWallet from '../models/SystemWallet.js';
import { v4 as uuidv4 } from 'uuid';

// 1. पैसे जोड़ना (LPU COIN Minting)
export const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid injection amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User identity not found' });
    }

    const numericAmount = Number(amount);

    // FIX: Math calculation ensuring no string concatenation
    user.walletBalance = Number(user.walletBalance || 0) + numericAmount;
    user.totalCashAdded = Number(user.totalCashAdded || 0) + numericAmount;
    await user.save();

    // System Wallet Update (Campus Reserve)
    let systemWallet = await SystemWallet.findOne();
    if (!systemWallet) {
      systemWallet = await SystemWallet.create({
        totalCashReserve: numericAmount,
        totalCoinsInSystem: numericAmount
      });
    } else {
      systemWallet.totalCashReserve = Number(systemWallet.totalCashReserve) + numericAmount;
      systemWallet.totalCoinsInSystem = Number(systemWallet.totalCoinsInSystem) + numericAmount;
      await systemWallet.save();
    }

    // Create Transaction Record (CREDIT)
    await Transaction.create({
      fromUserId: userId,
      toMerchantId: userId, // Self-Topup
      amount: numericAmount,
      type: 'CREDIT',
      transactionId: `MINT-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'SUCCESS',
      description: 'Capital Topup via Bank Node'
    });

    res.status(200).json({
      success: true,
      message: 'Capital synchronized successfully',
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. पेमेंट प्रोसेस करना (User to Merchant)
export const processPayment = async (req, res) => {
  try {
    const { merchantId, amount } = req.body;
    const userId = req.user.id;

    if (!merchantId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Target ID or Amount missing' });
    }

    const user = await User.findById(userId);
    const merchant = await User.findById(merchantId);

    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({ message: 'Invalid Merchant Node' });
    }

    const numericAmount = Number(amount);

    // Balance Verification
    if (Number(user.walletBalance) < numericAmount) {
      return res.status(400).json({ message: 'Insufficient liquidity in wallet' });
    }

    // Execute Balances Update
    user.walletBalance = Number(user.walletBalance) - numericAmount;
    await user.save();

    merchant.walletBalance = Number(merchant.walletBalance) + numericAmount;
    await merchant.save();

    // Create Transaction Record (DEBIT)
    const transactionId = `TXN-${uuidv4().substring(0, 12).toUpperCase()}`;
    await Transaction.create({
      fromUserId: userId,
      toMerchantId: merchantId,
      amount: numericAmount,
      type: 'DEBIT',
      transactionId,
      status: 'SUCCESS',
      description: `Payment dispatched to ${merchant.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Transmission Successful',
      transactionId,
      newBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. यूजर-स्पेसिफिक ट्रांजेक्शन हिस्ट्री (Private History Fix)
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // FIX: $or query ensure user ONLY sees their own transactions
    // (Jahan user sender hai ya user receiver hai)
    const transactions = await Transaction.find({
      $or: [
        { fromUserId: userId },
        { toMerchantId: userId }
      ]
    })
    .populate('fromUserId', 'name profileImage')
    .populate('toMerchantId', 'name profileImage')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. वॉलेट बैलेंस प्राप्त करना
export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Identity missing' });
    }

    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance,
      totalCashAdded: user.totalCashAdded
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};