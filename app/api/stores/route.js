export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Store from '@/models/Store';
import Role from '@/models/Role';

async function hasStorePermission() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  if (!userRole) return false;
  if (userRole === 'Super Admin') return true;

  await connectToDatabase();
  const roleRecord = await Role.findOne({ name: userRole });
  if (roleRecord) {
    return roleRecord.permissions.includes('stores');
  }
  return false;
}

export async function GET(req) {
  try {
    await connectToDatabase();
    
    const isAuthorized = await hasStorePermission();
    let stores;
    if (isAuthorized) {
      stores = await Store.find().populate('manager').sort({ createdAt: -1 });
    } else {
      stores = await Store.find({ status: 'Active' }).populate('manager').sort({ createdAt: -1 });
    }
    
    return NextResponse.json({ success: true, stores });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const isAuthorized = await hasStorePermission();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    if (!data.name || !data.location) {
      return NextResponse.json({ success: false, message: 'Name and location are required' }, { status: 400 });
    }

    const newStore = await Store.create(data);
    return NextResponse.json({ success: true, store: newStore });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
