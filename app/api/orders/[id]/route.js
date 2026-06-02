import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';

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
  const body = await request.json();
  const { status, isPaid, isDelivered, street, city, state, zipCode, phone } = body;
  
  await connectToDatabase();
  try {
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
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
    return NextResponse.json({ success: true, message: 'Order updated successfully', order });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  await connectToDatabase();
  try {
    const deleted = await Order.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
