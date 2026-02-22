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

// --- CORS CONFIGURATION ---
// Isme hum multiple origins allow karenge: Localhost aur aapki future Vercel site
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:3000',
  'https://your-app-name.vercel.app' // <-- Deploy ke baad apna Vercel link yahan add karna
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MONGODB CONNECTION ---
// Security Fix: Ab ye link sirf .env se aayega, code mein nahi dikhega
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4 
})
.then(() => console.log('✅ MongoDB Connected to Atlas!'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err.message);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mess', messRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'LPU COIN Server is active' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});