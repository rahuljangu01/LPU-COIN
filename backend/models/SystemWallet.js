import mongoose from 'mongoose';

const systemWalletSchema = new mongoose.Schema({
  totalCashReserve: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCoinsInSystem: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SystemWallet', systemWalletSchema);
