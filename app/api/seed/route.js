export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Store from '@/models/Store';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Expense from '@/models/Expense';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // WARNING: This clears data. Only for demo setup!
    await User.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Expense.deleteMany({});

    // 1. Seed Users first
    const hashedPassword = await bcrypt.hash('Balaji@123', 10);
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const accountantPassword = await bcrypt.hash('Accountant@123', 10);
    const storePassword = await bcrypt.hash('Store@123', 10);
    const customerPassword = await bcrypt.hash('Customer@123', 10);

    const usersData = [
      { name: 'Balaji', email: 'balaji@hillandvalley.com', password: hashedPassword, role: 'Super Admin' },
      { name: 'Admin User', email: 'admin@hillandvalley.com', password: adminPassword, role: 'Admin' },
      { name: 'Accountant User', email: 'accountant@hillandvalley.com', password: accountantPassword, role: 'Accountant' },
      { name: 'Store Manager', email: 'store@hillandvalley.com', password: storePassword, role: 'Store Manager' },
      { name: 'Customer User', email: 'customer@hillandvalley.com', password: customerPassword, role: 'Customer' }
    ];
    const createdUsers = await User.insertMany(usersData);
    const storeManagerUser = createdUsers.find(u => u.email === 'store@hillandvalley.com');

    // 2. Seed Stores with Manager
    const storesData = [
      { name: 'Hill & Valley Madurai', location: 'Madurai, TN', manager: storeManagerUser._id, contactNumber: '+919876543210', email: 'madurai@hillandvalley.com' },
      { name: 'Hill & Valley Coimbatore', location: 'Coimbatore, TN', manager: null, contactNumber: '+919876543211', email: 'coimbatore@hillandvalley.com' },
      { name: 'Hill & Valley Chennai', location: 'Chennai, TN', manager: null, contactNumber: '+919876543212', email: 'chennai@hillandvalley.com' },
    ];
    const createdStores = await Store.insertMany(storesData);

    // 3. Seed Categories
    const categoriesData = [
      { name: 'Spices', description: 'Premium Indian Spices' },
      { name: 'Coconut Powder', description: 'Organic Coconut Powder' },
      { name: 'Coconut Oil', description: 'Cold Pressed Coconut Oil' },
      { name: 'Herbal Products', description: 'Natural Herbal Extracts' },
      { name: 'Organic Foods', description: 'Healthy Organic Foods' },
      { name: 'Dry Products', description: 'Sun-dried premium products' }
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    // 4. Seed Products with Store
    const productsData = [
      {
        name: 'Premium Cardamom',
        sku: 'SP-CARD-001',
        slug: 'premium-cardamom',
        description: 'Finest quality cardamom pods directly sourced from the estates of Kerala.',
        price: 450,
        discountPrice: 399,
        stock: 150,
        weight: '100g',
        category: createdCategories.find(c => c.name === 'Spices')._id,
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        store: createdStores[0]._id
      },
      {
        name: 'Organic Turmeric Powder',
        sku: 'SP-TURM-002',
        slug: 'organic-turmeric-powder',
        description: 'Pure organic turmeric powder with high curcumin content.',
        price: 250,
        discountPrice: 199,
        stock: 300,
        weight: '250g',
        category: createdCategories.find(c => c.name === 'Spices')._id,
        images: ['https://images.unsplash.com/photo-1615486171448-433b9138f265?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        store: createdStores[0]._id
      },
      {
        name: 'Cold Pressed Coconut Oil',
        sku: 'CO-OIL-001',
        slug: 'cold-pressed-coconut-oil',
        description: '100% pure cold pressed coconut oil extracted from fresh coconuts.',
        price: 600,
        discountPrice: 549,
        stock: 100,
        weight: '1L',
        category: createdCategories.find(c => c.name === 'Coconut Oil')._id,
        images: ['https://images.unsplash.com/photo-1628156681099-3174dc0fc386?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        store: createdStores[0]._id
      },
      {
        name: 'Desiccated Coconut Powder',
        sku: 'CO-POW-001',
        slug: 'desiccated-coconut-powder',
        description: 'Premium desiccated coconut powder perfect for cooking and baking.',
        price: 350,
        discountPrice: 299,
        stock: 200,
        weight: '500g',
        category: createdCategories.find(c => c.name === 'Coconut Powder')._id,
        images: ['https://images.unsplash.com/photo-1550605763-ebf29f0e1fb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        store: createdStores[0]._id
      }
    ];
    await Product.insertMany(productsData);

    return NextResponse.json({ success: true, message: 'Database seeded successfully with all demo data.' });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
