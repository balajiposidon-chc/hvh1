import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();
    const product = new Product({
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice || 0,
        category: body.category,
        brand: body.brand,
        stock: body.stock,
        images: body.images || [],
        status: body.status || 'active',
        featured: body.featured || false,
    });
    await product.save();
    return NextResponse.json({ message: 'Created product', id: product._id.toString() }, { status: 201 });
}
