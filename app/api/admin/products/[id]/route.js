import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/models/Category';

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';
    const hasStorePanel = permissions.includes('store-panel');

    if (!isSuperAdmin && !permissions.includes('products') && !(isStoreManager && hasStorePanel)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();

    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    if (isStoreManager && !isSuperAdmin) {
        const Store = (await import('@/models/Store')).default;
        const managerStore = await Store.findOne({ manager: session.user.id || session.user._id });
        if (!managerStore || existingProduct.store?.toString() !== managerStore._id.toString()) {
            return NextResponse.json({ message: 'Unauthorized: Product belongs to another store' }, { status: 403 });
        }
    }

    let categoryId = null;
    if (body.category) {
        let cat = await Category.findOne({ name: new RegExp('^' + body.category.trim() + '$', 'i') });
        if (!cat) {
            cat = new Category({ name: body.category.trim(), description: 'Auto-created category' });
            await cat.save();
        }
        categoryId = cat._id;
    }

    const updatedData = {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice || 0,
        category: categoryId,
        categoryName: body.category,
        brand: body.brand,
        stock: body.stock,
        unit: body.unit || 'piece',
        images: body.images || [],
        status: body.status || 'active',
        featured: body.featured || false,
    };

    // If Super Admin specifies a store, allow changing it
    if (isSuperAdmin && body.store !== undefined) {
        updatedData.store = body.store || null;
    }

    const product = await Product.findByIdAndUpdate(params.id, updatedData, { new: true });
    return NextResponse.json({ message: 'Updated product' });
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    const isStoreManager = role === 'store manager' || role === 'manager';
    const hasStorePanel = permissions.includes('store-panel');

    if (!isSuperAdmin && !permissions.includes('products') && !(isStoreManager && hasStorePanel)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    await connectToDatabase();
    try {
        const existingProduct = await Product.findById(params.id);
        if (!existingProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        if (isStoreManager && !isSuperAdmin) {
            const Store = (await import('@/models/Store')).default;
            const managerStore = await Store.findOne({ manager: session.user.id || session.user._id });
            if (!managerStore || existingProduct.store?.toString() !== managerStore._id.toString()) {
                return NextResponse.json({ message: 'Unauthorized: Product belongs to another store' }, { status: 403 });
            }
        }

        await existingProduct.deleteOne();
        return NextResponse.json({ message: 'Product deleted' });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
