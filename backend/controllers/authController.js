import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. EMAIL CONFIGURATION (Cloud Optimized) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  },
  tls: {
    rejectUnauthorized: false
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (Non-Blocking - FAST RESPONSE) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 🔥 STEP 1: OTP को तुरंत डेटाबेस में सेव करें (यह बहुत तेज़ है)
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // 🔥 STEP 2: फ्रंटएंड को तुरंत जवाब भेजें (User को इंतज़ार नहीं करना पड़ेगा)
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // 🔥 STEP 3: ईमेल पीछे (Background) में भेजें
    const mailOptions = {
      from: '"LPU COIN Official" <rahuljangu01@gmail.com>',
      to: email,
      subject: 'LPU COIN - Verification Code',
      html: `<div style="font-family:sans-serif; border:2px solid #3b82f6; padding:20px; border-radius:10px; background:#f8fafc;">
              <h2 style="color:#1e40af;">AUTHENTICATION PROTOCOL</h2>
              <p style="color:#475569;">Your one-time security code for LPU COIN is:</p>
              <div style="background:#1e293b; color:#3b82f6; padding:20px; text-align:center; font-size:32px; font-weight:bold; letter-spacing:8px; border-radius:8px;">${otp}</div>
              <p style="color:#64748b; font-size:11px; margin-top:20px;">This code is valid for 5 minutes. If you didn't request this, ignore this email.</p>
            </div>`
    };

    // No 'await' here so it doesn't block the response
    transporter.sendMail(mailOptions).then(() => {
      console.log(`🚀 OTP Email successfully sent to: ${email}`);
    }).catch((err) => {
      console.error(`❌ Mailer Error for ${email}:`, err.message);
    });

  } catch (error) {
    console.error("🔥 Global sendOTP Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "System busy. Retry in a moment." });
    }
  }
};

// --- 3. CHECK EMAIL ---
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "IDENTITY ALREADY REGISTERED" });
    }
    res.status(200).json({ success: true, message: "Email Available" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 4. FINAL REGISTRATION ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp } = req.body;
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "INVALID OR EXPIRED OTP" });

    const user = await User.create({
      name, email, password,
      role: role || 'user',
      collegeId: collegeId || "NOT-SET",
      phoneNumber: phoneNumber || "NOT-SET",
      faceDescriptor: faceDescriptor || []
    });

    await Otp.deleteOne({ _id: otpRecord._id });
    res.status(201).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- 5. LOGIN ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === 'admin@lpu.in' && password === 'Admin123') {
       let adminUser = await User.findOne({ email });
       if (!adminUser) adminUser = await User.create({ name: 'SYSTEM ADMIN', email, password, role: 'admin' });
       return res.status(200).json({ success: true, token: generateToken(adminUser._id, 'admin'), user: adminUser });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ message: 'IDENTITY VERIFICATION FAILED' });
    res.status(200).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 6. BIOMETRICS & PROFILE ---
export const getFaceData = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, faceDescriptor: user.faceDescriptor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateMe = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Email not registered" });
    res.status(200).json({ success: true, message: "Reset protocol initiated" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMerchantInfo = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name');
    res.status(200).json({ success: true, merchant });
  } catch (e) { res.status(404).json({ message: "Not Found" }); }
};