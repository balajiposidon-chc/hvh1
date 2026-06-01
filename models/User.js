import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Admin', 'Accountant', 'Store Manager', 'Customer'],
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
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
