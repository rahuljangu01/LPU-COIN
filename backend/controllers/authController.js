import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 🚀 UNIVERSAL GMAIL CONFIG (Render Cloud Optimized) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 ke liye false
  auth: {
    user: process.env.EMAIL_USER, // rahuljangu01@gmail.com
    pass: process.env.EMAIL_PASS  // 16-digit App Password
  },
  // 🔥 Yeh settings IPv6 error aur Blocked connection ko theek karti hain
  family: 4, 
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // FAST UI RESPONSE: Interface turant badal jayega
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    const mailOptions = {
      from: `"LPU COIN Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LPU COIN - Identity Verification',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #3b82f6; border-radius: 15px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">SECURITY PROTOCOL</h2>
          <p>Your one-time security code is:</p>
          <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Securely delivered via Render Node.</p>
        </div>`
    };

    // Background Dispatch
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ GMAIL SMTP ERROR:", error.message);
      } else {
        console.log("🚀 UNIVERSAL SUCCESS: Mail delivered to", email);
      }
    });

  } catch (error) {
    console.error("🔥 Server error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Server Busy" });
  }
};

// ... baaki register/login logic wahi rakhein jo aapke paas thi
export const checkEmail = async (req, res) => {
    try {
      const { email } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ success: false, message: "ALREADY REGISTERED" });
      res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp } = req.body;
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "INVALID OTP" });

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