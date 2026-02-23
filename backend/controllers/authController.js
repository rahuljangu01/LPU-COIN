import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. EMAIL CONFIGURATION (Optimized for Cloud) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  },
  tls: {
    rejectUnauthorized: false // Helps connecting from cloud servers
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. CHECK EMAIL AVAILABILITY ---
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

// --- 3. SEND OTP (Optimized Logic) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📨 Attempting OTP dispatch for:", email);

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // DB Update
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    const mailOptions = {
      from: `"LPU COIN Official" <${process.env.EMAIL_USER || 'rahuljangu01@gmail.com'}>`,
      to: email,
      subject: 'LPU COIN - Identity Verification',
      html: `
        <div style="font-family:sans-serif; border:2px solid #3b82f6; padding:20px; border-radius:10px;">
          <h2 style="color:#1e40af;">ENROLLMENT PROTOCOL</h2>
          <p>Your one-time security code is:</p>
          <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:28px; font-weight:bold; letter-spacing:5px;">${otp}</div>
          <p style="font-size:10px; color:gray; margin-top:20px;">Requested from LPU COIN Nexus Node.</p>
        </div>`
    };

    // 🔥 Fix: Send response immediately to stop "Pending" on frontend
    // Email sending happens in the background
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("📧 Mailer Error:", error.message);
      else console.log("🚀 Email Dispatched Successfully!");
    });

    return res.status(200).json({ success: true, message: "OTP Dispatched to Gmail" });

  } catch (error) {
    console.error("🔥 Global sendOTP Error:", error.message);
    res.status(500).json({ message: "System busy, please retry in 30s" });
  }
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
      collegeId: collegeId || "REG-PENDING",
      phoneNumber: phoneNumber || "NOT-SET",
      faceDescriptor: faceDescriptor || []
    });

    await Otp.deleteOne({ _id: otpRecord._id });
    res.status(201).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- 5. LOGIN (Admin Bypass & Normal) ---
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

// --- 6. FACE DATA & PROFILE ---
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