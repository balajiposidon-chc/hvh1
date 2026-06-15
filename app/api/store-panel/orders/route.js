import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Store from '@/models/Store';
import Order from '@/models/Order';

export async function GET(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user._id;
    const role = session.user.role?.toLowerCase();
    const isStoreManager = ['store manager', 'manager'].includes(role);
    const isSuperAdmin = ['super admin', 'superadmin'].includes(role);

    if (!isStoreManager && !isSuperAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    let store = null;
    if (isStoreManager) {
      store = await Store.findOne({ manager: userId });
      if (!store) {
        return NextResponse.json({ success: false, message: 'No store assigned to this manager' }, { status: 404 });
      }
    } else {
      const { searchParams } = new URL(req.url);
      const storeIdParam = searchParams.get('storeId');
      if (storeIdParam) {
        store = await Store.findById(storeIdParam);
      } else {
        store = await Store.findOne();
      }
      if (!store) {
        return NextResponse.json({ success: false, message: 'No stores exist' }, { status: 404 });
      }
    }

    const orders = await Order.find({ store: store._id }).populate('user', 'name email').populate('store').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Store Scoped Orders Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
