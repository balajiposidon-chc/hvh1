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

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const isAuthorized = await hasStorePermission();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const store = await Store.findById(params.id);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    if (body.name !== undefined) store.name = body.name;
    if (body.location !== undefined) store.location = body.location;
    if (body.status !== undefined) store.status = body.status;
    if (body.contactNumber !== undefined) store.contactNumber = body.contactNumber;
    if (body.email !== undefined) store.email = body.email;
    if (body.manager !== undefined) store.manager = body.manager || null;

    await store.save();
    const populatedStore = await Store.findById(store._id).populate('manager');
    return NextResponse.json({ success: true, store: populatedStore });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const isAuthorized = await hasStorePermission();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const store = await Store.findById(params.id);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    await store.deleteOne();
    return NextResponse.json({ success: true, message: 'Store deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
