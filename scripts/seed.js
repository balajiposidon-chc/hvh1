const bcrypt = require('bcryptjs');
const connect = require('../services/db');
const User = require('../models/User').default || require('../models/User');
const Product = require('../models/Product').default || require('../models/Product');
const Category = require('../models/Category').default || require('../models/Category');
const Store = require('../models/Store').default || require('../models/Store');
const Order = require('../models/Order').default || require('../models/Order');
const Invoice = require('../models/Invoice').default || require('../models/Invoice');
const Transaction = require('../models/Transaction').default || require('../models/Transaction');
const { generateInvoiceNumber } = require('../utils/format');

const seed = async () => {
  await connect();
  console.log('Connected to MongoDB.');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Store.deleteMany({}),
    Order.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({})
  ]);

  const users = [
    { name: 'Balaji', email: 'balaji@hillandvalley.com', password: 'Balaji@123', role: 'Super Admin' },
    { name: 'Admin', email: 'admin@hillandvalley.com', password: 'Admin@123', role: 'Admin' },
    { name: 'Accountant', email: 'accountant@hillandvalley.com', password: 'Accountant@123', role: 'Accountant' },
    { name: 'Store', email: 'store@hillandvalley.com', password: 'Store@123', role: 'Store Manager' },
    { name: 'Customer', email: 'customer@hillandvalley.com', password: 'Customer@123', role: 'Customer' }
  ];

  const createdUsers = [];
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    const record = new User({ ...user, password: hashed });
    await record.save();
    createdUsers.push(record);
  }

  const storeManagerUser = createdUsers.find(u => u.email === 'store@hillandvalley.com');

  const stores = [
    { name: 'Hill & Valley Madurai', location: 'Madurai, Tamil Nadu', manager: storeManagerUser._id, contactNumber: '+919876543210', email: 'madurai@hillandvalley.com', revenue: 128400 },
    { name: 'Hill & Valley Coimbatore', location: 'Coimbatore, Tamil Nadu', manager: null, contactNumber: '+919876543211', email: 'coimbatore@hillandvalley.com', revenue: 102500 },
    { name: 'Hill & Valley Chennai', location: 'Chennai, Tamil Nadu', manager: null, contactNumber: '+919876543212', email: 'chennai@hillandvalley.com', revenue: 147300 }
  ];

  const createdStores = await Store.insertMany(stores);

  const categoriesData = [
    { name: 'Spices', description: 'Premium Spices' },
    { name: 'Coconut Oil', description: 'Coconut-based oil products' },
    { name: 'Herbal Products', description: 'Natural herbs and tea' }
  ];

  const createdCategories = await Category.insertMany(categoriesData);

  const products = [
    {
      name: 'Madurai Organic Cardamom',
      sku: 'HV-CARD-001',
      slug: 'madurai-organic-cardamom',
      description: 'Premium green cardamom sourced from the hill farms of Madurai.',
      category: createdCategories.find(c => c.name === 'Spices')._id,
      categoryName: 'Spices',
      price: 625,
      offerPrice: 499,
      gst: 5,
      stockQuantity: 42,
      weight: '100g',
      images: ['https://res.cloudinary.com/demo/image/upload/v1680000000/cardamom.jpg'],
      gallery: [],
      tags: ['Aromatic', 'Premium'],
      featured: true
    },
    {
      name: 'Cold-Pressed Coconut Oil',
      sku: 'HV-COIL-001',
      slug: 'cold-pressed-coconut-oil',
      description: 'Nourishing coconut oil extracted through cold press for daily wellness.',
      category: createdCategories.find(c => c.name === 'Coconut Oil')._id,
      categoryName: 'Coconut Oil',
      price: 420,
      offerPrice: 359,
      gst: 5,
      stockQuantity: 58,
      weight: '250ml',
      images: ['https://res.cloudinary.com/demo/image/upload/v1680000000/coconut_oil.jpg'],
      gallery: [],
      tags: ['Nourishing', 'Organic'],
      featured: true
    },
    {
      name: 'Herbal Turmeric Chai Blend',
      sku: 'HV-HERB-001',
      slug: 'herbal-turmeric-chai-blend',
      description: 'A warming blend of turmeric, ginger, and local herbs for calming tea rituals.',
      category: createdCategories.find(c => c.name === 'Herbal Products')._id,
      categoryName: 'Herbal Products',
      price: 270,
      offerPrice: 225,
      gst: 5,
      stockQuantity: 64,
      weight: '100g',
      images: ['https://res.cloudinary.com/demo/image/upload/v1680000000/herbal_chai.jpg'],
      gallery: [],
      tags: ['Wellness', 'Comfort'],
      featured: true
    }
  ];

  const productsWithStore = products.map(p => ({ ...p, store: createdStores[0]._id }));
  const createdProducts = await Product.insertMany(productsWithStore);

  const order = new Order({
    user: createdUsers.find((u) => u.role === 'Customer')._id,
    store: createdStores[0]._id,
    orderItems: [
      { 
        product: createdProducts[0]._id, 
        name: createdProducts[0].name, 
        quantity: 2, 
        price: 499 
      },
      { 
        product: createdProducts[2]._id, 
        name: createdProducts[2].name, 
        quantity: 1, 
        price: 225 
      }
    ],
    shippingAddress: {
      street: '123 Main Street',
      city: 'Madurai',
      state: 'Tamil Nadu',
      zipCode: '625001'
    },
    phone: '+919876543210',
    paymentMethod: 'COD',
    itemsPrice: 1223,
    taxPrice: 61,
    shippingPrice: 50,
    totalPrice: 1334,
    isPaid: true,
    paidAt: new Date(),
    isDelivered: false,
    status: 'Pending'
  });
  await order.save();

  const invoice = new Invoice({
    invoiceNumber: generateInvoiceNumber(),
    order: order._id,
    customer: order.user,
    store: order.store,
    totalAmount: 1334,
    taxAmount: 61,
    status: 'Paid',
    pdfUrl: ''
  });
  await invoice.save();

  const transaction = new Transaction({
    order: order._id,
    user: createdUsers.find((u) => u.role === 'Customer')._id,
    type: 'sale',
    amount: 1334,
    description: 'Demo order payment'
  });
  await transaction.save();

  console.log('Seed data created successfully.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
