import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    try {
        const role = session.user.role?.toLowerCase();
        let orders;
        if (['super admin', 'superadmin', 'admin', 'manager', 'store manager'].includes(role)) {
            // Admin sees all orders
            orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).lean();
        } else {
            // Customer sees only their own orders
            orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
        }
        
        // Map fields to match client-side expectation if needed (like totalPrice -> total, etc.)
        const mappedOrders = orders.map(order => ({
            ...order,
            // Ensure compatibility with various frontend versions
            totalPrice: order.totalPrice || order.total || 0,
        }));
        
        return NextResponse.json({ success: true, orders: mappedOrders });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

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
    try {
        // Parse raw address string into schema fields
        let parsedAddress = {
            street: address,
            city: 'Hill & Valley',
            state: 'Kerala',
            zipCode: '682001'
        };
        if (typeof address === 'string') {
            const parts = address.split(',').map(p => p.trim());
            if (parts.length >= 4) {
                parsedAddress.street = parts.slice(0, parts.length - 3).join(', ');
                parsedAddress.city = parts[parts.length - 3];
                parsedAddress.state = parts[parts.length - 2];
                parsedAddress.zipCode = parts[parts.length - 1];
            } else if (parts.length === 3) {
                parsedAddress.street = parts[0];
                parsedAddress.city = parts[1];
                parsedAddress.state = parts[2];
            }
        } else if (address && typeof address === 'object') {
            parsedAddress = {
                street: address.street || parsedAddress.street,
                city: address.city || parsedAddress.city,
                state: address.state || parsedAddress.state,
                zipCode: address.zipCode || parsedAddress.zipCode
            };
        }

        const orderItems = items.map((item) => ({
            product: item.id || item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || '',
        }));

        const order = new Order({
            user: session.user.id,
            orderItems: orderItems,
            shippingAddress: parsedAddress,
            phone,
            paymentMethod: 'COD', // Cash on Delivery
            itemsPrice: Number(subtotal),
            taxPrice: Number(tax),
            shippingPrice: Number(shippingFee),
            totalPrice: Number(total),
            status: 'Pending',
        });

        await order.save();

        // Decrement product inventory
        for (const item of orderItems) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
        }
        
        return NextResponse.json({ success: true, message: 'Order created', orderId: order._id.toString() }, { status: 201 });
    } catch (err) {
        console.error("Order creation error:", err);
        return NextResponse.json({ message: 'Internal Server Error', error: err.message }, { status: 500 });
    }
}
