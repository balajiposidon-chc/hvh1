import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  weight: { type: String },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Draft', 'Out of Stock'], default: 'Active' },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String }
  }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
