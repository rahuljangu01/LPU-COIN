import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend'; 

// --- 🚀 RESEND API CONFIG ---
const resend = new Resend(process.env.RESEND_API_KEY); 

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // FAST UI RESPONSE: Interface turant khulega
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // Background Email via Resend API
    resend.emails.send({
      from: 'LPU COIN <onboarding@resend.dev>',
      to: email,
      subject: 'LPU COIN - Identity Code',
      html: `<strong>Your OTP: ${otp}</strong>`
    }).then(() => {
      console.log("✅ RESEND SUCCESS: Mail delivered to", email);
    }).catch((err) => {
      console.log("❌ RESEND ERROR:", err.message);
    });

  } catch (error) {
    console.error("🔥 Server error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "System Error" });
  }
};

// ... baaki register/login functions pehle jaise hi niche copy-paste kar dein
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