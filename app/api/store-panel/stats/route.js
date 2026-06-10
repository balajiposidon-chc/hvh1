export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Store from '@/models/Store';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Expense from '@/models/Expense';

export async function GET(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user._id;
    const role = session.user.role?.toLowerCase();

    // Check store manager or superadmin
    const isStoreManager = ['store manager', 'manager'].includes(role);
    const isSuperAdmin = ['super admin', 'superadmin'].includes(role);

    if (!isStoreManager && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized access to store stats' }, { status: 403 });
    }

    let store = null;
    if (isStoreManager) {
      store = await Store.findOne({ manager: userId });
      if (!store) {
        return NextResponse.json({ success: false, message: 'No store assigned to this manager' }, { status: 404 });
      }
    } else {
      // For Super Admin, fallback to first store or support query param
      const { searchParams } = new URL(req.url);
      const storeIdParam = searchParams.get('storeId');
      if (storeIdParam) {
        store = await Store.findById(storeIdParam);
      } else {
        store = await Store.findOne();
      }
      if (!store) {
        return NextResponse.json({ success: false, message: 'No stores exist in the system' }, { status: 404 });
      }
    }

    const storeId = store._id;

    // 1. Total Products Count
    const totalProducts = await Product.countDocuments({ store: storeId });

    // 2. Low Stock Count (<= 10)
    const lowStockItems = await Product.countDocuments({ store: storeId, stock: { $lte: 10 } });

    // 3. Orders scoped to this store
    const storeOrders = await Order.find({ store: storeId }).populate('user', 'name email').sort({ createdAt: -1 });
    const totalOrders = storeOrders.length;
    const activeOrders = storeOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

    // 4. Revenue calculation
    const deliveredOrders = storeOrders.filter(o => o.status === 'Delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0);

    // 5. Expenses scoped to store
    const expenses = await Expense.find({ storeId: storeId }).sort({ date: -1 });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const recentExpenses = expenses.slice(0, 10);
    const recentOrders = storeOrders.slice(0, 5);

    // 6. Dynamic Monthly Chart Data (Last 6 Months)
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthName = monthNames[monthIndex];
      
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      
      const monthOrders = deliveredOrders.filter(o => o.createdAt >= start && o.createdAt <= end);
      const monthExpenses = expenses.filter(e => e.date >= start && e.date <= end);
      
      const rev = monthOrders.reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0);
      const exp = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      monthlyData.push({
        name: monthName,
        revenue: Math.round(rev),
        expense: Math.round(exp),
        sales: monthOrders.length
      });
    }

    return NextResponse.json({
      success: true,
      store: {
        id: store._id,
        name: store.name,
        location: store.location,
        status: store.status
      },
      summary: {
        totalProducts,
        lowStockItems,
        totalOrders,
        activeOrders,
        totalRevenue,
        totalExpenses,
        netProfit
      },
      recentOrders,
      recentExpenses,
      monthlyData
    });
  } catch (error) {
    console.error('Store Panel Stats Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
