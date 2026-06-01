import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: { type: [String], required: true, default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    featured: { type: Boolean, default: false },
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
