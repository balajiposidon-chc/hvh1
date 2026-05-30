export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import { verifyAuth } from '@/utils/auth';

export async function GET(req) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    
    // If not authenticated, return empty or handle based on public needs
    // For now, let's allow fetching stores for the frontend demo
    const stores = await Store.find({ status: 'Active' });
    return NextResponse.json({ success: true, stores });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    
    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const newStore = await Store.create(data);
    
    return NextResponse.json({ success: true, store: newStore });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
