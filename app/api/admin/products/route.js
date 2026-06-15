import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/models/Category';

export async function POST(request) {
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
    
    let storeId = body.store || null;
    if (isStoreManager) {
        const Store = (await import('@/models/Store')).default;
        const managerStore = await Store.findOne({ manager: session.user.id || session.user._id });
        if (!managerStore) {
            return NextResponse.json({ message: 'No store assigned to this manager' }, { status: 404 });
        }
        storeId = managerStore._id;
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

    const product = new Product({
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
        store: storeId,
        addedBy: session.user.id || session.user._id,
    });
    await product.save();
    return NextResponse.json({ message: 'Created product', id: product._id.toString() }, { status: 201 });
}
