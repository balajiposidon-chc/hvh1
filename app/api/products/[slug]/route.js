export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connect from '../../../../services/db';
import Product from '../../../../models/Product';
import Store from '../../../../models/Store';
import User from '../../../../models/User';

export async function GET(request, { params }) {
  await connect();
  const product = await Product.findOne({ slug: params.slug, status: { $in: ['active', 'Active'] } })
    .populate('category', 'name')
    .populate('store', 'name')
    .populate('addedBy', 'name email');
  if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });

  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  const isSuperAdmin = role === 'super admin' || role === 'superadmin';

  const productObj = product.toObject();
  if (!isSuperAdmin) {
    delete productObj.addedBy;
    delete productObj.store;
  }

  return NextResponse.json({ product: productObj });
}

export async function PUT(request, { params }) {
  await connect();
  const data = await request.json();
  const product = await Product.findOneAndUpdate({ slug: params.slug }, data, { new: true });
  if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  await connect();
  const product = await Product.findOneAndUpdate({ slug: params.slug }, { status: 'archived' }, { new: true });
  if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product, message: 'Product archived.' });
}
