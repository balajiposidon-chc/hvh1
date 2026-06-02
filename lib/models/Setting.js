import mongoose from 'mongoose';
const SettingSchema = new mongoose.Schema({
    storeName: { type: String, default: 'Hill & Valley Spices' },
    logo: { type: String, default: '' },
    contactEmail: { type: String, default: 'info@store.com' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 5 },
    shippingFee: { type: Number, default: 0 },
    socialLinks: { type: Object, default: {} },
    themeMode: { type: String, default: 'light' }, // default theme changed to light as requested
    primaryColor: { type: String, default: '#D2143A' },
    bgColor: { type: String, default: '#F8F9FA' },
    fontColor: { type: String, default: '#1A1A1A' },
    heroTitle: { type: String, default: 'Sourced from Nature, Perfected by Tradition' },
    heroSubtitle: { type: String, default: "Discover Hill & Valley's premium collection of hand-picked regional spices, organic cold-pressed oils, and wellness blends. Ethically sourced directly from local estate farmers to preserve original rich aromas." },
    heroImage: { type: String, default: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
    heroBtnText: { type: String, default: 'Explore Collection' },
    heroBtnLink: { type: String, default: '/products' }
}, { timestamps: true });
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export default Setting;
