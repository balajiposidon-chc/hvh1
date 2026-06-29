import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    default: 'Customer'
  },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bloodGroup: { type: String },
  idProofNumber: { type: String },
  idProofImage: { type: String },
  profileImage: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Prevent double-hashing if the password is already a bcrypt hash
  const isHashed = /^\$2[ayb]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(this.password);
  if (isHashed) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
