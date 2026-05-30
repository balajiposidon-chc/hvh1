export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyJwtToken } from '@/utils/auth';

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    
    const decoded = await verifyJwtToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = await req.json();

    if (orderItems && orderItems.length === 0) {
      return NextResponse.json({ message: 'No order items' }, { status: 400 });
    } else {
      const order = new Order({
        orderItems,
        user: decoded.id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      });

      const createdOrder = await order.save();
      return NextResponse.json({ success: true, order: createdOrder }, { status: 201 });
    }
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    
    const decoded = await verifyJwtToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    await dbConnect();

    // If admin, fetch all, else fetch only user's
    let orders;
    if (['Super Admin', 'Admin', 'Accountant', 'Store Manager'].includes(decoded.role)) {
      orders = await Order.find({}).populate('user', 'id name').populate('store', 'name');
    } else {
      orders = await Order.find({ user: decoded.id });
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
