import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes Imports
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messRoutes from './routes/messRoutes.js';

dotenv.config();
const app = express();

/* ======================================================
   🔐 THE ULTIMATE CORS FIX (Nuclear Solution)
====================================================== */
app.use(cors({
  origin: true, // Allow all incoming origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Pre-flight check (Crucial for Vercel -> Render)
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// DB Connection
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000, family: 4 })
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.log('❌ DB Connection Error:', err.message));

app.get('/', (req, res) => res.status(200).send('🚀 LPU COIN API IS LIVE'));
app.get('/api/health', (req, res) => res.json({ status: 'Nexus Online', time: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mess', messRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 System Active on Port ${PORT}`));