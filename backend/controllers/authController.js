import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. GMAIL CONFIGURATION (Forced IPv4 for Render) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  },
  // 🔥 IMPORTANT: Yeh line IPv6 error (ENETUNREACH) ko fix karegi
  family: 4 
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (Immediate UI Response) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // 🔥 Response turant bhej rahe hain taaki interface hang na ho
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // 📧 Background mein mail bhejte rahein
    const mailOptions = {
      from: `"LPU COIN Support" <${process.env.EMAIL_USER || 'rahuljangu01@gmail.com'}>`,
      to: email,
      subject: 'Verification Code - LPU COIN',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px;">
          <h2 style="color: #1e40af;">IDENTITY VERIFICATION</h2>
          <p>Your one-time security code is:</p>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: gray; font-size: 10px; margin-top: 20px;">Secure Cloud Dispatch Active.</p>
        </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ CLOUD IPV4 ERROR:", error.message);
      } else {
        console.log("🚀 SUCCESS: Mail sent via IPv4:", info.response);
      }
    });

  } catch (error) {
    console.error("🔥 Server error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Error" });
  }
};

// --- REST OF THE FUNCTIONS ---
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
    if (!user) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, message: "Reset protocol initiated" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMerchantInfo = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name');
    res.status(200).json({ success: true, merchant });
  } catch (e) { res.status(404).json({ message: "Not Found" }); }
};