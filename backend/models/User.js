import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    // अपडेटेड Regex: यह Gmail और अन्य सभी फॉर्मेट को सपोर्ट करेगा
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // Plain Text: Atlas में सीधा दिखेगा
  },
  role: {
    type: String,
    enum: ['user', 'merchant', 'admin'],
    default: 'user'
  },
  
  // --- कैंपस आइडेंटिटी फ़ील्ड्स ---
  collegeId: {
    type: String,
    default: "NOT_SET"
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  department: {
    type: String,
    default: "General"
  },
  profileImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  },

  // --- वॉलेट और इकोनॉमी फ़ील्ड्स ---
  walletBalance: {
    type: Number,
    default: 0
  },
  totalCashAdded: {
    type: Number,
    default: 0
  },

  // --- बायोमेट्रिक फ़ील्ड (AI Face Recognition) ---
  faceDescriptor: {
    type: Array, // 128 यूनिक नंबर्स का एरे
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// पासवर्ड हैशिंग (Bcrypt) यहाँ से हटा दी गई है ताकि आप Atlas में पासवर्ड देख सकें।

export default mongoose.model('User', userSchema);