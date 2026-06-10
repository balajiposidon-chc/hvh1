export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';
    const hasStorePanel = permissions.includes('store-panel');
    
    if (!isSuperAdmin && !permissions.includes('accounting') && !(isStoreManager && hasStorePanel)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get('storeId');

    let store = null;
    if (isStoreManager) {
      const Store = (await import('@/models/Store')).default;
      store = await Store.findOne({ manager: session.user.id || session.user._id });
      if (!store) {
        return NextResponse.json({ success: false, message: 'No store assigned to this manager' }, { status: 404 });
      }
    } else if (storeIdParam) {
      const Store = (await import('@/models/Store')).default;
      store = await Store.findById(storeIdParam);
    }

    let expenseQuery = {};
    let orderQuery = { status: 'Delivered' };

    if (store) {
      expenseQuery.storeId = store._id;
      orderQuery.store = store._id;
    }

    // Scoped accounting summary
    const expenses = await Expense.find(expenseQuery).sort({ date: -1 });
    const orders = await Order.find(orderQuery); // only completed orders as revenue
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json({ 
      success: true, 
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit
      },
      recentExpenses: expenses.slice(0, 10)
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';
    const hasStorePanel = permissions.includes('store-panel');
    
    if (!isSuperAdmin && !permissions.includes('accounting') && !(isStoreManager && hasStorePanel)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    data.addedBy = session.user.id || session.user._id;
    
    if (isStoreManager) {
      const Store = (await import('@/models/Store')).default;
      const store = await Store.findOne({ manager: session.user.id || session.user._id });
      if (!store) {
        return NextResponse.json({ success: false, message: 'No store assigned to this manager' }, { status: 404 });
      }
      data.storeId = store._id;
    } else if (data.storeId) {
      const Store = (await import('@/models/Store')).default;
      const store = await Store.findById(data.storeId);
      if (!store) {
        return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
      }
      data.storeId = store._id;
    }
    
    const newExpense = await Expense.create(data);
    
    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
