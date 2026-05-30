const bcrypt = require('bcrypt');
const connect = require('../services/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const { generateInvoiceNumber } = require('../utils/format');

const seed = async () => {
  await connect();
  console.log('Connected to MongoDB.');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Store.deleteMany({}),
    Order.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({})
  ]);

  const users = [
    { firstName: 'Balaji', email: 'balaji@hillandvalley.com', password: 'Balaji@123', role: 'Super Admin' },
    { firstName: 'Admin', email: 'admin@hillandvalley.com', password: 'Admin@123', role: 'Admin' },
    { firstName: 'Accountant', email: 'accountant@hillandvalley.com', password: 'Accountant@123', role: 'Accountant' },
    { firstName: 'Store', email: 'store@hillandvalley.com', password: 'Store@123', role: 'Store Manager' },
    { firstName: 'Customer', email: 'customer@hillandvalley.com', password: 'Customer@123', role: 'Customer' }
  ];

  const createdUsers = [];
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    const record = new User({ ...user, password: hashed });
    await record.save();
    createdUsers.push(record);
  }

  const stores = [
    { name: 'Hill & Valley Madurai', location: 'Madurai, Tamil Nadu', managerEmail: 'store@hillandvalley.com', revenue: 128400 },
    { name: 'Hill & Valley Coimbatore', location: 'Coimbatore, Tamil Nadu', managerEmail: 'store@hillandvalley.com', revenue: 102500 },
    { name: 'Hill & Valley Chennai', location: 'Chennai, Tamil Nadu', managerEmail: 'store@hillandvalley.com', revenue: 147300 }
  ];

  const createdStores = await Store.insertMany(stores);

  const products = [
    {
      name: 'Madurai Organic Cardamom',
      sku: 'HV-CARD-001',
      slug: 'madurai-organic-cardamom',
      description: 'Premium green cardamom sourced from the hill farms of Madurai.',
      category: 'Spices',
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
      category: 'Coconut Oil',
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
      category: 'Herbal Products',
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

  const createdProducts = await Product.insertMany(products);

  const order = new Order({
    user: createdUsers.find((u) => u.role === 'Customer')._id,
    store: createdStores[0]._id,
    products: [
      { product: createdProducts[0]._id, quantity: 2, price: 499 },
      { product: createdProducts[2]._id, quantity: 1, price: 225 }
    ],
    subtotal: 1223,
    tax: 61,
    shipping: 50,
    total: 1334,
    status: 'confirmed',
    paymentStatus: 'paid'
  });
  await order.save();

  const invoice = new Invoice({
    invoiceNumber: generateInvoiceNumber(),
    order: order._id,
    user: order.user,
    amount: 1334,
    gst: 61,
    paid: true,
    pdfUrl: ''
  });
  await invoice.save();
  order.invoice = invoice._id;
  await order.save();

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
