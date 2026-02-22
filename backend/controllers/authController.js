import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// --- 1. ईमेल कॉन्फ़िगरेशन (LPU COIN OFFICIAL GATEWAY) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rahuljangu01@gmail.com', 
    pass: 'htjsgoxpzvalgtth' 
  }
});

// टोकन जनरेटर
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'lpu_coin_2024';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

// --- 2. ईमेल उपलब्धता की जांच (Enrollment Pre-check) ---
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "IDENTITY ALREADY REGISTERED" });
    }
    res.status(200).json({ success: true, message: "Email Available" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. OTP जेनरेशन और डिस्पैच ---
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP को डेटाबेस में सेव करें (5 मिनट के लिए)
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

    await transporter.sendMail({
      from: '"LPU COIN Support" <rahuljangu01@gmail.com>',
      to: email,
      subject: 'LPU COIN - Identity Verification Code',
      html: `
        <div style="font-family: sans-serif; border: 2px solid #3b82f6; padding: 25px; border-radius: 15px; background-color: #f8fafc;">
          <h2 style="color: #1e40af; margin-bottom: 10px;">LPU COIN ENROLLMENT</h2>
          <p style="color: #475569;">Your one-time biometric synchronization code is:</p>
          <div style="background: #1e293b; color: #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px; mt-4;">This code is valid for 5 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "OTP Dispatched to Gmail" });
  } catch (error) {
    res.status(500).json({ message: "EMAIL SERVICE OFFLINE" });
  }
};

// --- 4. फाइनल रजिस्ट्रेशन (OTP + Bio-Data Fusion) ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, phoneNumber, faceDescriptor, otp } = req.body;

    // OTP वेरिफिकेशन
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "INVALID OR EXPIRED OTP" });

    // नया यूजर बनाना
    const user = await User.create({
      name,
      email,
      password, // Plain text as requested
      role: role || 'user',
      collegeId: collegeId || "REG-PENDING",
      phoneNumber: phoneNumber || "NOT-SET",
      faceDescriptor: faceDescriptor || []
    });

    await Otp.deleteOne({ _id: otpRecord._id });
    
    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(400).json({ message: error.message.toUpperCase() });
  }
};

// --- 5. लॉगिन (With Admin Bypass Logic) ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. SPECIAL ADMIN BYPASS (बिना रजिस्टर किए)
    if (email === 'admin@lpu.in' && password === 'Admin123') {
      let adminUser = await User.findOne({ email });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'SYSTEM ADMINISTRATOR',
          email: 'admin@lpu.in',
          password: 'Admin123',
          role: 'admin',
          collegeId: 'LPU-HQ-001'
        });
      }
      const token = generateToken(adminUser._id, 'admin');
      return res.status(200).json({ success: true, token, user: adminUser });
    }

    // B. NORMAL USER LOGIN
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'IDENTITY VERIFICATION FAILED' });
    }

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. फेस बायोमेट्रिक्स प्राप्त करना (लॉगिन सिंक के लिए) ---
export const getFaceData = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.status(400).json({ message: "Biometrics not enrolled" });
    }
    
    res.status(200).json({ success: true, faceDescriptor: user.faceDescriptor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 7. प्रोफाइल और सुरक्षा सेटिंग्स ---
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateMe = async (req, res) => {
  try {
    const { profileImage, password } = req.body;
    const updateData = {};
    if (profileImage) updateData.profileImage = profileImage;
    if (password) updateData.password = password;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { returnDocument: 'after' });
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- 8. मर्चेंट और पासवर्ड रिसेट ---
export const getMerchantInfo = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('name');
    res.status(200).json({ success: true, merchant });
  } catch (e) { res.status(404).json({ message: "Merchant Not Found" }); }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const resetUrl = `http://localhost:3000/reset-password/${user._id}`;
    await transporter.sendMail({
      from: 'rahuljangu01@gmail.com',
      to: email,
      subject: 'LPU COIN - Identity Reset Protocol',
      text: `Authorize identity key reset by clicking here: ${resetUrl}`
    });
    res.status(200).json({ success: true, message: "Reset link sent to Gmail" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const resetPassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    await User.findByIdAndUpdate(id, { password: newPassword });
    res.status(200).json({ success: true, message: "Identity Key Successfully Rotated" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};