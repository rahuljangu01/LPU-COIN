import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. GMAIL CONFIGURATION (Cloud Optimized) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  },
  tls: {
    rejectUnauthorized: false // Cloud connectivity ke liye zaroori
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (Strict Await Version) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP DB mein save karein
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    const mailOptions = {
      from: `"LPU COIN Official" <${process.env.EMAIL_USER || 'rahuljangu01@gmail.com'}>`,
      to: email,
      subject: 'LPU COIN - Identity Verification',
      html: `
        <div style="font-family:sans-serif; padding:20px; border:2px solid #3b82f6; border-radius:10px;">
          <h2 style="color:#1e40af;">AUTHENTICATION PROTOCOL</h2>
          <p>Your security code is:</p>
          <div style="background:#f1f5f9; padding:20px; text-align:center; font-size:30px; font-weight:bold; letter-spacing:10px;">${otp}</div>
          <p style="color:gray; font-size:10px; margin-top:20px;">Render Cloud System Security.</p>
        </div>`
    };

    // 🔥 V.IMP: Ab hum wait karenge jab tak mail na nikal jaye
    console.log("📨 Attempting to send mail via Render...");
    
    try {
      await transporter.sendMail(mailOptions);
      console.log("🚀 Mail accepted by SMTP server!");
      return res.status(200).json({ success: true, message: "OTP Sent Successfully" });
    } catch (mailError) {
      console.error("❌ NODEMAILER FAIL:", mailError.message);
      return res.status(500).json({ 
        success: false, 
        message: "Email Blocked by Google Security. Please check Render Logs." 
      });
    }

  } catch (error) {
    console.error("🔥 Server Error:", error.message);
    res.status(500).json({ message: "Internal server busy" });
  }
};

// --- REST OF THE FUNCTIONS (KEEP SAME) ---
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "IDENTITY ALREADY REGISTERED" });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp } = req.body;
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "INVALID OTP" });
    const user = await User.create({ name, email, password, role: role || 'user', collegeId: collegeId || "NOT-SET", phoneNumber: phoneNumber || "NOT-SET", faceDescriptor: faceDescriptor || [] });
    await Otp.deleteOne({ _id: otpRecord._id });
    res.status(201).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === 'admin@lpu.in' && password === 'Admin123') {
       let adminUser = await User.findOne({ email });
       if (!adminUser) adminUser = await User.create({ name: 'ADMIN', email, password, role: 'admin' });
       return res.status(200).json({ success: true, token: generateToken(adminUser._id, 'admin'), user: adminUser });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ message: 'FAILED' });
    res.status(200).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getFaceData = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, faceDescriptor: user.faceDescriptor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req, res) => {
  try { const user = await User.findById(req.user.id); res.status(200).json({ success: true, user }); } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateMe = async (req, res) => {
  try { const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }); res.status(200).json({ success: true, user }); } catch (error) { res.status(500).json({ message: error.message }); }
};

export const forgotPassword = async (req, res) => {
  try { const user = await User.findOne({ email: req.body.email }); if (!user) return res.status(404).json({ message: "Not found" }); res.status(200).json({ success: true, message: "Sent" }); } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMerchantInfo = async (req, res) => {
  try { const merchant = await User.findById(req.params.id).select('name'); res.status(200).json({ success: true, merchant }); } catch (e) { res.status(404).json({ message: "Not Found" }); }
};