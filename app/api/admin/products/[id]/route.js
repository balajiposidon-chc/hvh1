import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();
    const product = await Product.findByIdAndUpdate(params.id, {
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
    }, { new: true });
    if (!product) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Updated product' });
}
