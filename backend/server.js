import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messRoutes from './routes/messRoutes.js';

dotenv.config();

const app = express();

/* ======================================================
   🔐 CORS CONFIGURATION (PRODUCTION READY)
====================================================== */

// Automatically read frontend URL from environment
const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel URL (set in Render env)
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

/* ======================================================
   🔧 MIDDLEWARE
====================================================== */

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ======================================================
   🗄️ MONGODB CONNECTION
====================================================== */

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4,
})
.then(() => console.log('✅ MongoDB Connected to Atlas!'))
.catch((err) => {
  console.log('❌ MongoDB Connection Error:', err.message);
  process.exit(1); // stop server if DB fails
});

/* ======================================================
   🚀 ROUTES
====================================================== */

app.get('/', (req, res) => {
  res.send('🚀 LPU COIN Backend Running on Render');
});

app.get('/api/health', (req, res) =>
  res.json({ status: 'LPU COIN Server is active' })
);

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
  console.log(`🚀 Server running on port ${PORT}`);
});