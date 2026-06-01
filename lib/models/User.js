import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'customer'], default: 'customer' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
