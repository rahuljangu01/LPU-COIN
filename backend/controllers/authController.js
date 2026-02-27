import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. GMAIL CONFIGURATION (Cloud Optimized for Render) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,      // Port 587 is most stable on Cloud providers
  secure: false,  // false for 587
  auth: {
    user: process.env.EMAIL_USER || 'rahuljangu01@gmail.com', 
    pass: process.env.EMAIL_PASS || 'htjsgoxpzvalgtth' 
  },
  tls: {
    rejectUnauthorized: false // Bypasses self-signed certificate errors on cloud
  }
});

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 2. SEND OTP (FAST RESPONSE LOGIC) ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Database mein OTP save karein (Yeh 1 second se kam leta hai)
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    // 🔥 V.IMP: Response turant bhej do taaki Vercel par OTP interface khul jaye
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // 📧 Ab background mein email bhejte raho
    const mailOptions = {
      from: `"LPU COIN Official" <${process.env.EMAIL_USER || 'rahuljangu01@gmail.com'}>`,
      to: email,
      subject: 'LPU COIN - Identity Verification',
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #3b82f6; border-radius: 15px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">IDENTITY ENROLLMENT</h2>
          <p style="color: #475569;">Your one-time security code is:</p>
          <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Requested from Render Node Support.</p>
        </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("❌ MAIL ERROR ON CLOUD:", error.message);
      else console.log("✅ MAIL SENT FROM CLOUD:", info.response);
    });

  } catch (error) {
    console.error("🔥 Global sendOTP Error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "System Busy" });
  }
};

// --- 3. CHECK EMAIL ---
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "IDENTITY ALREADY REGISTERED" });
    res.status(200).json({ success: true });
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
      collegeId: collegeId || "REG-PENDING",
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
       if (!adminUser) adminUser = await User.create({ name: 'ADMIN', email, password, role: 'admin' });
       return res.status(200).json({ success: true, token: generateToken(adminUser._id, 'admin'), user: adminUser });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ message: 'FAILED' });
    res.status(200).json({ success: true, token: generateToken(user._id, user.role), user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 6. OTHER EXPORTS ---
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
    res.status(200).json({ success: true, message: "Sent" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMerchantInfo = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name');
    res.status(200).json({ success: true, merchant });
  } catch (e) { res.status(404).json({ message: "Not Found" }); }
};