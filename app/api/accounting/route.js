export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Order from '@/models/Order';
import { verifyAuth } from '@/utils/auth';

export async function GET(req) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    
    if (!user || (user.role !== 'Super Admin' && user.role !== 'Accountant')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Basic accounting summary
    const expenses = await Expense.find().sort({ date: -1 });
    const orders = await Order.find({ status: 'Delivered' }); // only completed orders as revenue
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
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
    const user = await verifyAuth(req);
    
    if (!user || (user.role !== 'Super Admin' && user.role !== 'Accountant')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    data.addedBy = user.userId;
    
    const newExpense = await Expense.create(data);
    
    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
