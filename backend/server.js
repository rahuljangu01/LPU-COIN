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
   🔐 FINAL CORS CONFIGURATION (Nexus Offline Fix)
====================================================== */
const allowedOrigins = [
  'https://lpucoin.vercel.app',   // Aapka Vercel URL
  'http://localhost:3000',        // Local Testing
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Requests with no origin (like mobile apps or Postman) are allowed
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list or is a Vercel preview branch
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked Origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle Pre-flight requests (Bohot zaroori hai browser calls ke liye)
app.options('*', cors());

/* ======================================================
   🔧 MIDDLEWARE (JSON Limits for Face Data)
====================================================== */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ======================================================
   🗄️ MONGODB CONNECTION
====================================================== */
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, { 
  serverSelectionTimeoutMS: 5000, 
  family: 4 // Force IPv4 for Atlas connection stability
})
.then(() => console.log('✅ MongoDB Connected to Atlas Successfully!'))
.catch((err) => console.log('❌ MongoDB Connection Error:', err.message));

/* ======================================================
   🚀 API ROUTES
====================================================== */
app.get('/', (req, res) => res.send('🚀 LPU COIN API IS LIVE AND ACTIVE'));
app.get('/api/health', (req, res) => res.json({ status: 'Nexus Online', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mess', messRoutes);

/* ======================================================
   🎯 SERVER START
====================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 System Online: Port ${PORT}`);
  console.log(`🔗 Allowed Frontend: https://lpucoin.vercel.app`);
});