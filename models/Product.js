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
  unit: { type: String, default: 'piece' },
  hsnCode: { type: String, default: '' },
  gstRate: { type: Number, default: 5 },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

  // Auto-classify HSN and GST based on product name if empty or default
  if (!this.hsnCode || this.gstRate === 5) {
    const hsnMap = [
      { keywords: ['cardamom', 'elaichi'], hsn: '0908', gst: 5 },
      { keywords: ['pepper', 'kurumulaku'], hsn: '0904', gst: 5 },
      { keywords: ['clove', 'grampoo'], hsn: '0907', gst: 5 },
      { keywords: ['nutmeg', 'jathikka'], hsn: '0908', gst: 5 },
      { keywords: ['cinnamon', 'karuvapatta'], hsn: '0906', gst: 5 },
      { keywords: ['ginger', 'inji'], hsn: '0910', gst: 5 },
      { keywords: ['turmeric', 'manjal'], hsn: '0910', gst: 5 },
      { keywords: ['saffron', 'kesar'], hsn: '0910', gst: 5 },
      { keywords: ['vanilla'], hsn: '0905', gst: 5 },
      { keywords: ['tea', 'chai'], hsn: '0902', gst: 5 },
      { keywords: ['coffee', 'kaapi'], hsn: '0901', gst: 5 },
      { keywords: ['honey', 'then'], hsn: '0409', gst: 5 },
      { keywords: ['dry fruit', 'cashew', 'almond', 'badam'], hsn: '0801', gst: 12 },
      { keywords: ['oil', 'essential oil', 'massage oil'], hsn: '3301', gst: 18 },
      { keywords: ['chocolate', 'cocoa'], hsn: '1806', gst: 18 },
      { keywords: ['jam', 'sauce', 'butter', 'spread'], hsn: '2007', gst: 12 },
      { keywords: ['soap', 'shampoo', 'cosmetic'], hsn: '3401', gst: 18 },
    ];
    const nameLower = (this.name || '').toLowerCase();
    const matched = hsnMap.find(item => item.keywords.some(k => nameLower.includes(k)));
    if (matched) {
      if (!this.hsnCode) this.hsnCode = matched.hsn;
      if (this.gstRate === 5) this.gstRate = matched.gst;
    } else {
      if (!this.hsnCode) this.hsnCode = '0908';
    }
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
