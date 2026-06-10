import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Store from '@/models/Store';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';

    if (!isSuperAdmin && !permissions.includes('accounting') && !(isStoreManager && permissions.includes('store-panel'))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });
    }

    // Tenant check for store managers
    if (isStoreManager && !isSuperAdmin) {
      const store = await Store.findOne({ manager: session.user.id });
      if (!store || expense.storeId?.toString() !== store._id.toString()) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Expense belongs to another store' }, { status: 403 });
      }
    }

    if (data.title !== undefined) expense.title = data.title;
    if (data.amount !== undefined) expense.amount = data.amount;
    if (data.category !== undefined) expense.category = data.category;
    if (data.date !== undefined) expense.date = data.date;
    if (data.notes !== undefined) expense.notes = data.notes;

    await expense.save();
    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Update Expense Detail Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';

    if (!isSuperAdmin && !permissions.includes('accounting') && !(isStoreManager && permissions.includes('store-panel'))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });
    }

    // Tenant check for store managers
    if (isStoreManager && !isSuperAdmin) {
      const store = await Store.findOne({ manager: session.user.id });
      if (!store || expense.storeId?.toString() !== store._id.toString()) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Expense belongs to another store' }, { status: 403 });
      }
    }

    await expense.deleteOne();
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete Expense Detail Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
