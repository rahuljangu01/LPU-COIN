import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. GMAIL CONFIGURATION (Cloud Port 587 Fix) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,      // 🔥 465 cloud par block hota hai, 587 use karein
  secure: false,  // 🔥 587 ke liye hamesha false rakhein
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    // Yeh Render ke shared IP issues ko bypass karta hai
    rejectUnauthorized: false 
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (Wait for Delivery) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    const mailOptions = {
      from: `"LPU COIN Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LPU COIN Identity Verification Code',
      html: `
        <div style="font-family: sans-serif; border: 2px solid #3b82f6; padding: 25px; border-radius: 15px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">IDENTITY ENROLLMENT</h2>
          <p style="color: #475569;">Your one-time security code is:</p>
          <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Requested via Render Cloud Protocol.</p>
        </div>`
    };

    // Yahan hum wait karenge taaki timeout error pakda ja sake
    console.log(`📨 Attempting cloud delivery to: ${email}`);
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Success: OTP sent from Render to ${email}`);
      return res.status(200).json({ success: true, message: "OTP Sent" });
    } catch (mailError) {
      console.error("❌ CLOUD MAIL FAIL:", mailError.message);
      // Agar email fail hua toh interface ko aage mat badhne do
      return res.status(500).json({ 
        message: "Email service blocked by Google Cloud Security. Please check App Password." 
      });
    }

  } catch (error) {
    console.error("🔥 Global Error:", error);
    res.status(500).json({ message: "System Error" });
  }
};

// ... baaki functions wahi rakhein jo aapke paas the (checkEmail, register, login, etc.)
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
      collegeId: collegeId || "REG-PENDING",
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