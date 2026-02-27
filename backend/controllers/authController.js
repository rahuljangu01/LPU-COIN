import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import axios from 'axios'; 

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'lpu_coin_2024', { expiresIn: '7d' });
};

// --- 🚀 FINAL PERMANENT FIX: MAILJET API ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate({ email: email.trim().toLowerCase() }, { otp }, { upsert: true, new: true });

    // Frontend ko turant reply (Fast UI)
    res.status(200).json({ success: true, message: "OTP Dispatched" });

    // Mailjet Authentication
    const authHeader = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64');

    const mailData = {
      Messages: [{
        From: { 
          Email: "rahuljangu01@gmail.com", // ⚠️ Ye wahi email hai jisse Mailjet banaya hai
          Name: "LPU COIN Support" 
        },
        To: [{ Email: email.trim().toLowerCase() }],
        Subject: "Identity Verification Protocol",
        HTMLPart: `
          <div style="font-family: sans-serif; padding: 25px; border: 2px solid #3b82f6; border-radius: 15px; background-color: #f8fafc;">
            <h2 style="color: #1e40af; margin-bottom: 10px;">LPU COIN ENROLLMENT</h2>
            <p style="color: #475569;">Your one-time security code is:</p>
            <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Securely delivered via Mailjet Cloud Node.</p>
          </div>`
      }]
    };

    // Mailjet API call
    axios.post('https://api.mailjet.com/v3.1/send', mailData, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    })
    .then(() => console.log(`✅ MAILJET SUCCESS: OTP sent to ${email}`))
    .catch((err) => console.log("❌ MAILJET ERROR:", err.response?.data || err.message));

  } catch (error) {
    console.error("🔥 Global System Error:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Error" });
  }
};

// --- REST OF THE LOGIC (Keep exactly same) ---
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