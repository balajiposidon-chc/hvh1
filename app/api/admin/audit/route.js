export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Expense from '@/models/Expense';
import Role from '@/models/Role';
import Store from '@/models/Store';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';

    // Only Super Admins or roles with 'audit' permission can run system audit
    if (!isSuperAdmin && !permissions.includes('audit')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const startTime = Date.now();
    await connectToDatabase();
    const dbLatency = Date.now() - startTime;

    // Fetch all required data
    const users = await User.find({}).lean();
    const products = await Product.find({}).lean();
    const orders = await Order.find({}).lean();
    const expenses = await Expense.find({}).lean();
    const roles = await Role.find({}).lean();
    const stores = await Store.find({}).lean();

    // 1. Accounts Summary Calculation
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || o.total || o.itemsPrice || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const recentTransactions = [];
    // Map delivered orders as revenue transactions
    deliveredOrders.forEach(o => {
      recentTransactions.push({
        id: o._id.toString(),
        type: 'Revenue',
        description: `Order #${o._id.toString().slice(-6)} Fulfillment`,
        amount: o.totalPrice || o.total || o.itemsPrice || 0,
        date: o.deliveredAt || o.updatedAt || o.createdAt,
      });
    });
    // Map expenses as cost transactions
    expenses.forEach(e => {
      recentTransactions.push({
        id: e._id.toString(),
        type: 'Expense',
        description: e.description || e.category || 'Business Expense',
        amount: e.amount || 0,
        date: e.date || e.createdAt,
      });
    });
    // Sort transactions by date descending
    recentTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Product Stats Calculation
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stockQuantity || p.stock || 0)), 0);
    const outOfStockProducts = products.filter(p => (p.stockQuantity || p.stock || 0) <= 0);
    const outOfStockCount = outOfStockProducts.length;

    // 3. Client Stats Calculation
    const customers = users.filter(u => u.role?.toLowerCase() === 'customer');
    const totalClients = customers.length;
    const clientList = customers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      status: u.status || 'active',
      createdAt: u.createdAt,
    }));

    // 4. Run Diagnostic Scenarios (Integrity Tests)
    const scenarios = [];

    // Scenario 1: Database Health
    scenarios.push({
      id: 'db_health',
      name: 'Database Connection Latency',
      description: 'Pings the MongoDB server and checks connection response latency.',
      status: dbLatency < 500 ? 'Pass' : 'Warning',
      message: `Database connection active. Latency: ${dbLatency}ms.`,
    });

    // Scenario 2: Inventory Stock Analysis
    scenarios.push({
      id: 'stock_scan',
      name: 'Inventory Stock Scan',
      description: 'Scans catalog for out-of-stock items or anomalous negative stock levels.',
      status: outOfStockCount > 5 ? 'Warning' : 'Pass',
      message: outOfStockCount > 0 
        ? `Scan completed. Found ${outOfStockCount} out-of-stock items in catalog.` 
        : 'All catalog items have healthy positive stock levels.',
    });

    // Scenario 3: Orphaned Product References in Orders
    const productIdsSet = new Set(products.map(p => p._id.toString()));
    let orphanedCount = 0;
    orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          if (item.product && !productIdsSet.has(item.product.toString())) {
            orphanedCount++;
          }
        });
      }
    });
    scenarios.push({
      id: 'orphaned_refs',
      name: 'Orphaned Reference Audit',
      description: 'Verifies all items in historical orders map to existing products in the active catalog.',
      status: orphanedCount > 0 ? 'Warning' : 'Pass',
      message: orphanedCount > 0 
        ? `Audit completed. Found ${orphanedCount} order references pointing to deleted products.` 
        : 'All historical order records map to valid active products.',
    });

    // Scenario 4: User Role Validation
    const validRolesSet = new Set(['super admin', 'superadmin', 'admin', 'customer', 'store manager', 'manager', 'accountant']);
    roles.forEach(r => validRolesSet.add(r.name.toLowerCase()));
    
    let invalidRolesCount = 0;
    users.forEach(u => {
      if (u.role && !validRolesSet.has(u.role.toLowerCase())) {
        invalidRolesCount++;
      }
    });
    scenarios.push({
      id: 'role_val',
      name: 'User Role Integrity Verification',
      description: 'Scans user base to verify everyone is mapped to a valid system or custom role.',
      status: invalidRolesCount > 0 ? 'Warning' : 'Pass',
      message: invalidRolesCount > 0 
        ? `Integrity check completed. Found ${invalidRolesCount} users with invalid/dangling role assignments.` 
        : 'All user accounts map to valid system or custom roles.',
    });

    // Scenario 5: Store Assignment Audit
    let unassignedProductsCount = 0;
    products.forEach(p => {
      if (!p.store) {
        unassignedProductsCount++;
      }
    });
    scenarios.push({
      id: 'store_assign',
      name: 'Store Assignment Audit',
      description: 'Checks if products are correctly associated with a store reference for multi-tenancy.',
      status: unassignedProductsCount > 0 ? 'Warning' : 'Pass',
      message: unassignedProductsCount > 0 
        ? `Audit completed. Found ${unassignedProductsCount} products not assigned to any specific store.` 
        : 'All catalog products are assigned to active store channels.',
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalProducts,
        totalStockValue,
        outOfStockCount,
        totalClients,
        totalStores: stores.length,
      },
      scenarios,
      recentTransactions: recentTransactions.slice(0, 30),
      products: products.map(p => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        stock: p.stockQuantity || p.stock || 0,
        sku: p.sku || 'N/A',
      })),
      clients: clientList,
    });
  } catch (err) {
    console.error('Audit failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
