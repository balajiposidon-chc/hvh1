import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/models/Category';

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();

    let categoryId = null;
    if (body.category) {
        let cat = await Category.findOne({ name: new RegExp('^' + body.category.trim() + '$', 'i') });
        if (!cat) {
            cat = new Category({ name: body.category.trim(), description: 'Auto-created category' });
            await cat.save();
        }
        categoryId = cat._id;
    }

    const product = await Product.findByIdAndUpdate(params.id, {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice || 0,
        category: categoryId,
        categoryName: body.category,
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

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    await connectToDatabase();
    try {
        const product = await Product.findByIdAndDelete(params.id);
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product deleted' });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
