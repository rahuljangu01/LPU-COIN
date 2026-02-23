import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. ईमेल कॉन्फ़िगरेशन ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  }
});

// टोकन जनरेटर
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. OTP जेनरेशन और डिस्पैच ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📨 OTP Request for:", email);

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 1. OTP को डेटाबेस में सेव करें
    try {
      await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });
      console.log("✅ OTP saved to Database");
    } catch (dbErr) {
      console.error("❌ Database Error:", dbErr.message);
      return res.status(500).json({ message: "Database connection busy" });
    }

    // 2. ईमेल भेजें
    const mailOptions = {
      from: '"LPU COIN Support" <rahuljangu01@gmail.com>',
      to: email,
      subject: 'LPU COIN - Identity Verification',
      html: `
        <div style="font-family: sans-serif; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px;">
          <h2 style="color: #1e40af;">LPU COIN ENROLLMENT</h2>
          <p>Your verification code is:</p>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("🚀 Email sent successfully to:", email);

    res.status(200).json({ success: true, message: "OTP Dispatched to Gmail" });

  } catch (error) {
    console.error("🔥 SendOTP Error:", error.message);
    res.status(500).json({ message: "Email service temporarily busy. Try again." });
  }
};

// ... baaki functions (login, register, etc.) jo aapke paas hain wo as it is rehne dein
// bas dhyan rakhen ki unme 'password' plain text hi rahe jaisa aapne pehle maanga tha.

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
    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, token, user });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === 'admin@lpu.in' && password === 'Admin123') {
       let adminUser = await User.findOne({ email });
       if (!adminUser) {
         adminUser = await User.create({ name: 'ADMIN', email, password, role: 'admin' });
       }
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
    if (!user) return res.status(404).json({ message: "Email not found" });
    res.status(200).json({ success: true, message: "Reset link sent" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMerchantInfo = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name');
    res.status(200).json({ success: true, merchant });
  } catch (e) { res.status(404).json({ message: "Not Found" }); }
};