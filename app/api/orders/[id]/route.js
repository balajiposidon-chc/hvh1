import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { createSystemNotification } from '@/utils/notification';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
    return false;
  }
  return true;
}

export async function PUT(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  const userId = session?.user?.id || session?.user?._id;
  const isSuperAdmin = role === 'super admin' || role === 'superadmin';
  const isStoreManager = role === 'store manager' || role === 'manager';

  const body = await request.json();
  const { status, isPaid, isDelivered, street, city, state, zipCode, phone } = body;
  
  await connectToDatabase();
  try {
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (isStoreManager && !isSuperAdmin) {
      const Store = (await import('@/models/Store')).default;
      const managerStore = await Store.findOne({ manager: userId });
      if (!managerStore || order.store?.toString() !== managerStore._id.toString()) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Order belongs to another store' }, { status: 403 });
      }
    }
    
    if (status) order.status = status;
    if (isPaid !== undefined) {
      order.isPaid = isPaid;
      if (isPaid) order.paidAt = new Date();
    }
    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) {
        order.deliveredAt = new Date();
        order.status = 'Delivered';
      }
    }
    if (street || city || state || zipCode) {
      order.shippingAddress = {
        street: street || order.shippingAddress.street,
        city: city || order.shippingAddress.city,
        state: state || order.shippingAddress.state,
        zipCode: zipCode || order.shippingAddress.zipCode,
      };
    }
    if (phone) order.phone = phone;
    
    await order.save();
    await createSystemNotification({
      action: 'edit',
      resourceType: 'order',
      resourceId: order._id.toString(),
      details: `Order #ORD-${order._id.toString().toUpperCase().slice(-6)}`,
      sessionUser: session?.user
    });
    return NextResponse.json({ success: true, message: 'Order updated successfully', order });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  const userId = session?.user?.id || session?.user?._id;
  const isSuperAdmin = role === 'super admin' || role === 'superadmin';
  const isStoreManager = role === 'store manager' || role === 'manager';

  await connectToDatabase();
  try {
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (isStoreManager && !isSuperAdmin) {
      const Store = (await import('@/models/Store')).default;
      const managerStore = await Store.findOne({ manager: userId });
      if (!managerStore || order.store?.toString() !== managerStore._id.toString()) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Order belongs to another store' }, { status: 403 });
      }
    }

    await createSystemNotification({
      action: 'delete',
      resourceType: 'order',
      resourceId: params.id,
      details: `Order #ORD-${order._id.toString().toUpperCase().slice(-6)}`,
      sessionUser: session?.user
    });

    await order.deleteOne();
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
