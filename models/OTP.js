import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true
  },
  code: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
  }
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
