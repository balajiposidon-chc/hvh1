import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String },
  brand: { type: String, default: 'Hill & Valley' },
  stock: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  images: [{ type: String }],
  weight: { type: String },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String }
  }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

ProductSchema.pre('save', function(next) {
  if (this.stock !== undefined && (!this.stockQuantity || this.stockQuantity === 0)) {
    this.stockQuantity = this.stock;
  }
  if (this.stockQuantity !== undefined && (!this.stock || this.stock === 0)) {
    this.stock = this.stockQuantity;
  }
  if (this.featured !== undefined) {
    this.isFeatured = this.featured;
  }
  if (this.isFeatured !== undefined) {
    this.featured = this.isFeatured;
  }
  if (!this.brand) {
    this.brand = 'Hill & Valley';
  }
  if (!this.sku) {
    this.sku = 'HV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
