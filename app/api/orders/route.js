import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { address, phone, items, subtotal, tax, shippingFee, total } = body;
    if (!address || !phone || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ message: 'Invalid order information' }, { status: 400 });
    }
    await connectToDatabase();
    const orderItems = items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
    }));
    const order = new Order({
        user: session.user.id,
        items: orderItems,
        shippingAddress: address,
        phone,
        paymentMethod: 'card',
        subtotal,
        tax,
        shippingFee,
        total,
    });
    await order.save();
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    return NextResponse.json({ message: 'Order created', orderId: order._id.toString() }, { status: 201 });
}
