import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Store from '@/models/Store';

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'Super Admin';
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const userId = session?.user?.id || session?.user?._id;
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';

    const store = await Store.findById(params.id);
    if (!store) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    const isManager = store.manager && store.manager.toString() === userId;

    if (!isSuperAdmin && !isManager) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    if (body.name !== undefined) store.name = body.name;
    if (body.location !== undefined) store.location = body.location;
    if (body.contactNumber !== undefined) store.contactNumber = body.contactNumber;
    if (body.email !== undefined) store.email = body.email;

    // Only Super Admin can change status or manager assignment
    if (isSuperAdmin) {
      if (body.status !== undefined) store.status = body.status;
      if (body.manager !== undefined) store.manager = body.manager || null;
    }

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
    const isAuthorized = await isSuperAdmin();
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
