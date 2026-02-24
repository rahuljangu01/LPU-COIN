import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messRoutes from './routes/messRoutes.js';

dotenv.config();
const app = express();

/* ======================================================
   🔐 PRODUCTION CORS FIX
====================================================== */
app.use(cors({
  origin: true, // Sabhi sources allow
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000, family: 4 })
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.log('❌ DB Error:', err.message));

app.get('/', (req, res) => res.status(200).send('API Operational 🚀'));
app.get('/api/health', (req, res) => res.json({ status: 'Online' }));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mess', messRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));