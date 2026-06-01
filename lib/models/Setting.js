import mongoose from 'mongoose';
const SettingSchema = new mongoose.Schema({
    storeName: { type: String, default: 'HV Store' },
    logo: { type: String, default: '' },
    contactEmail: { type: String, default: 'info@store.com' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    socialLinks: { type: Object, default: {} },
}, { timestamps: true });
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export default Setting;
