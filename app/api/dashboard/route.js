export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connect from '../../../services/db';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import Store from '../../../models/Store';
import Invoice from '../../../models/Invoice';

export async function GET() {
  await connect();
  const orders = await Order.find();
  const products = await Product.find();
  const customers = await User.find({ role: 'Customer' });
  const stores = await Store.find();
  const invoices = await Invoice.find();

  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || order.total || 0), 0);
  const revenue = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const lowStock = products.filter((item) => item.stockQuantity < 10).length;

  const storePerformance = stores.map((store) => ({
    name: store.name,
    revenue: store.revenue || 0,
    orders: orders.filter((order) => String(order.store) === String(store._id)).length
  }));

  return NextResponse.json({
    totalSales,
    revenue,
    orders: orders.length,
    customers: customers.length,
    lowStock,
    storePerformance,
    recentOrders: orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    recentInvoices: invoices.sort((a, b) => b.issuedAt - a.issuedAt).slice(0, 5)
  });
}
