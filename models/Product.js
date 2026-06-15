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
  culinaryUses: { type: String, default: '' },
  storageCare: { type: String, default: '' },
  sourcingGuarantee: { type: String, default: '' },
  allergenSafety: { type: String, default: '' },
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

  // Auto-classify Culinary Uses, Storage & Care, Sourcing Guarantee, and Allergen Safety
  if (!this.culinaryUses || !this.storageCare || !this.sourcingGuarantee || !this.allergenSafety) {
    const tipsMap = [
      {
        keywords: ['cardamom', 'elaichi', 'pepper', 'kurumulaku', 'clove', 'grampoo', 'nutmeg', 'jathikka', 'cinnamon', 'karuvapatta', 'ginger', 'inji', 'turmeric', 'manjal', 'saffron', 'kesar', 'vanilla', 'tea', 'chai', 'coffee', 'kaapi'],
        culinaryUses: "Perfect for brewing aromatic chais, baking sweet pastries, or flavoring high-end savory curry sauces and rice dishes.",
        storageCare: "Keep inside an airtight glass container, stored in a cool, dry, dark cupboard away from direct sunshine to retain natural essential oils and aroma.",
        sourcingGuarantee: "Ethically hand-picked from premium organic estates in high-altitude zones, dried in temperature-controlled spaces to protect flavor retention.",
        allergenSafety: "Gluten-free, vegan-safe, and processed in a 100% peanut-free hygienic corporate packing environment."
      },
      {
        keywords: ['honey', 'then'],
        culinaryUses: "Excellent as a natural sweetener for tea and coffee, drizzled over desserts, or used in salad dressings and marinades.",
        storageCare: "Store at room temperature in a sealed container. Do not refrigerate. If crystallization occurs, place the jar in warm water.",
        sourcingGuarantee: "100% pure, unfiltered raw honey sourced directly from wild forest hives and local apiaries under sustainable practices.",
        allergenSafety: "100% natural, contains no additives. Not recommended for infants under 1 year of age."
      },
      {
        keywords: ['dry fruit', 'cashew', 'almond', 'badam', 'nuts'],
        culinaryUses: "Great for healthy snacking, adding to morning oatmeal, baking, or garnishing desserts and pilaf rice.",
        storageCare: "Store in a cool, dry place. Best kept in a sealed airtight container in the refrigerator to prevent rancidity and maintain crunch.",
        sourcingGuarantee: "Carefully sorted and grade-A selected from trusted orchard farms to ensure uniform size and premium quality.",
        allergenSafety: "Contains tree nuts. Processed in a facility that handles other nuts and sesame."
      },
      {
        keywords: ['oil', 'essential oil', 'massage oil'],
        culinaryUses: "For external use, aromatherapy, massage, or diluting with carrier oils. Check specific labels for culinary applicability.",
        storageCare: "Store in a cool, dark place in amber glass bottles. Keep away from heat, open flames, and direct sunlight.",
        sourcingGuarantee: "100% pure therapeutic-grade oil extracted using traditional steam distillation or cold-press extraction methods.",
        allergenSafety: "Highly concentrated. Conduct a patch test before skin application. Keep out of reach of children."
      },
      {
        keywords: ['chocolate', 'cocoa'],
        culinaryUses: "Perfect for chocolate desserts, hot cocoa drinks, baking recipes, or direct gourmet snacking.",
        storageCare: "Store in a cool, dry place (15-18°C) away from strong odors and heat sources to prevent fat bloom.",
        sourcingGuarantee: "Crafted from fine-flavor single-origin cocoa beans sourced via fair-trade partnerships with local farming co-operatives.",
        allergenSafety: "May contain trace amounts of milk solids, soy lecithin, and nuts depending on the specific batch recipe."
      },
      {
        keywords: ['jam', 'sauce', 'butter', 'spread'],
        culinaryUses: "Ideal as a breakfast spread on toasted bread, topping for pancakes, waffles, yogurt, or as dessert fillings.",
        storageCare: "Refrigerate after opening. Consume within 4 weeks of opening. Always use a clean spoon.",
        sourcingGuarantee: "Made from fresh, sun-ripened regional fruits cooked in small batches to preserve original taste and texture.",
        allergenSafety: "Contains fruit ingredients. Free from artificial colors, preservatives, and high-fructose corn syrup."
      },
      {
        keywords: ['soap', 'shampoo', 'cosmetic'],
        culinaryUses: "For external body, hair, and skincare use. Lather well with water and rinse thoroughly.",
        storageCare: "Keep on a draining soap dish between uses to keep it dry and extend its lifespan.",
        sourcingGuarantee: "Handmade using natural plant-derived saponified oils, botanical extracts, and essential oils.",
        allergenSafety: "Contains natural essential oils. Discontinue use if irritation or skin redness occurs."
      }
    ];

    const nameLower = (this.name || '').toLowerCase();
    const matched = tipsMap.find(item => item.keywords.some(k => nameLower.includes(k)));
    
    const fallback = {
      culinaryUses: "Versatile usage. Ideal for everyday culinary preparation or personal care depending on product type.",
      storageCare: "Keep in a cool, dry place inside an airtight container away from direct sunlight and humidity.",
      sourcingGuarantee: "Quality guaranteed and sourced from verified regional partners conforming to standard quality control.",
      allergenSafety: "Processed under hygienic conditions. Please check specific packaging labels for allergens."
    };

    const target = matched || fallback;

    if (!this.culinaryUses) this.culinaryUses = target.culinaryUses;
    if (!this.storageCare) this.storageCare = target.storageCare;
    if (!this.sourcingGuarantee) this.sourcingGuarantee = target.sourcingGuarantee;
    if (!this.allergenSafety) this.allergenSafety = target.allergenSafety;
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
