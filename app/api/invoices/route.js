export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connect from '../../../services/db';
import Invoice from '../../../models/Invoice';

export async function GET() {
  await connect();
  const invoices = await Invoice.find().populate('order user').sort({ issuedAt: -1 }).limit(50);
  return NextResponse.json({ invoices });
}

export async function POST(request) {
  await connect();
  const body = await request.json();
  const invoice = new Invoice(body);
  await invoice.save();
  return NextResponse.json({ invoice }, { status: 201 });
}
