export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { verifyJwtToken } from '@/utils/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');

    let query = {};
    if (category) {
      query.category = category;
    }
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('store', 'name')
      .populate('addedBy', 'name email');

    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';

    const processedProducts = products.map(p => {
      const obj = p.toObject();
      if (!isSuperAdmin) {
        delete obj.addedBy;
        delete obj.store;
      }
      return obj;
    });

    return NextResponse.json({ success: true, count: processedProducts.length, products: processedProducts });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    
    const decoded = await verifyJwtToken(token);
    if (!decoded || !['Super Admin', 'Admin', 'Store Manager'].includes(decoded.role)) {
      return NextResponse.json({ message: 'Not authorized for this action' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const product = await Product.create(body);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
