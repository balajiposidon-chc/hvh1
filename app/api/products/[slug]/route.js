export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connect from '../../../../services/db';
import Product from '../../../../models/Product';

export async function GET(request, { params }) {
  await connect();
  const product = await Product.findOne({ slug: params.slug, status: 'active' });
  if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product });
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
