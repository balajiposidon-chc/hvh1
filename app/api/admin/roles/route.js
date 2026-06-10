import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Role from '@/models/Role';

// Protect API so only Super Admins can manage roles
async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  const permissions = session?.user?.permissions || [];
  const isSuperAdmin = role === 'super admin' || role === 'superadmin';
  if (isSuperAdmin || permissions.includes('rbac')) {
    return true;
  }
  return false;
}

export async function GET(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  await connectToDatabase();
  try {
    const roles = await Role.find().sort({ name: 1 });
    return NextResponse.json({ success: true, roles });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  const { name, permissions } = body;
  if (!name) {
    return NextResponse.json({ success: false, message: 'Role name is required' }, { status: 400 });
  }
  await connectToDatabase();
  try {
    const existing = await Role.findOne({ name });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Role already exists' }, { status: 400 });
    }
    const newRole = new Role({ name, permissions });
    await newRole.save();
    return NextResponse.json({ success: true, message: 'Role created successfully', role: newRole });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  const { id, name, permissions } = body;
  if (!id) {
    return NextResponse.json({ success: false, message: 'Role ID is required for updates' }, { status: 400 });
  }
  await connectToDatabase();
  try {
    const updated = await Role.findByIdAndUpdate(id, { name, permissions }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Role updated successfully', role: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Role ID is required for deletion' }, { status: 400 });
  }
  await connectToDatabase();
  try {
    const deleted = await Role.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
