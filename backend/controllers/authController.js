import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- GMAIL CONFIGURATION (Cloud Optimized Fix) ---
// Render jaise cloud servers par Gmail ko 'service: gmail' ke saath use karna zyada stable hota hai
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS // 16 digit App Password (WITHOUT SPACES)
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
    
    // DB Update
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // 1. FRONTEND KO TURANT JAWAB BHEJO (UI fast chalega)
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // 2. EMAIL BACKGROUND MEIN DISPATCH KAREIN
    const mailOptions = {
      from: `"LPU COIN Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verification Code - LPU COIN',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px;">
          <h2 style="color: #1e40af;">Security Verification</h2>
          <p>Your security code is:</p>
          <h1 style="background: #f1f5f9; padding: 15px; text-align: center; letter-spacing: 10px;">${otp}</h1>
        </div>`
    };

    // Nodemailer apne aap best path dhoond lega (Port 465 ya 587)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ RENDER MAIL ERROR:", error.message);
      } else {
        console.log("🚀 EMAIL SENT SUCCESSFULLY FROM RENDER:", info.response);
      }
    });

  } catch (error) {
    console.error("🔥 Global Error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Server Error" });
  }
};

// ... baaki register/login logic same rakhein (pichli files se)
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
      if (!user) return res.status(404).json({ message: "Not registered" });
      res.status(200).json({ success: true, message: "Reset protocol initiated" });
    } catch (error) { res.status(500).json({ message: error.message }); }
  };
  
  export const getMerchantInfo = async (req, res) => {
    try {
      const merchant = await User.findById(req.params.id).select('name');
      res.status(200).json({ success: true, merchant });
    } catch (e) { res.status(404).json({ message: "Not Found" }); }
  };