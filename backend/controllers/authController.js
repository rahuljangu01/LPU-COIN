import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. GMAIL CONFIGURATION (The Most Stable Setup for Render) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Back to 465 for SSL stability on Render
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  debug: true, // Render logs mein detail dikhayega
  logger: true
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (Wait for success but with Timeout) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // DB mein naya OTP update karein
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    const mailOptions = {
      from: `"LPU COIN Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LPU COIN Identity Verification Code',
      html: `
        <div style="font-family: sans-serif; border: 1px solid #3b82f6; padding: 25px; border-radius: 15px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">IDENTITY ENROLLMENT</h2>
          <p style="color: #475569;">Your one-time security code is:</p>
          <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px;">This code is valid for 5 minutes.</p>
        </div>`
    };

    // 🔥 Ab hum 'await' use karenge taaki galti pakdi ja sake
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Success: OTP sent to ${email}`);
      return res.status(200).json({ success: true, message: "OTP Dispatched" });
    } catch (mailError) {
      console.error("❌ NODEMAILER ERROR:", mailError.message);
      // Agar email fail hua toh interface ko aage mat badhne do
      return res.status(500).json({ message: "Email service failed. Check App Password." });
    }

  } catch (error) {
    console.error("🔥 Global error:", error);
    res.status(500).json({ message: "System error" });
  }
};

// ... baaki functions wahi rakhein jo aapke paas the (checkEmail, register, etc.)
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
         if (!adminUser) adminUser = await User.create({ name: 'SYSTEM ADMIN', email, password, role: 'admin' });
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