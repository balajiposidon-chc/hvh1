import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  const permissions = session?.user?.permissions || [];
  const isSuperAdmin = role === 'super admin' || role === 'superadmin';
  if (isSuperAdmin || permissions.includes('users')) {
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
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const loggedInRole = session?.user?.role;
  const roleCheck = loggedInRole?.toLowerCase();
  const permissions = session?.user?.permissions || [];
  const isSuperAdmin = roleCheck === 'super admin' || roleCheck === 'superadmin';
  if (!isSuperAdmin && !permissions.includes('users')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  const { name, email, password, role, status } = body;
  
  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: 'Name, email, and password are required' }, { status: 400 });
  }
  
  if (role === 'Super Admin' && !isSuperAdmin) {
    return NextResponse.json({ success: false, message: 'Only a Super Admin can create a Super Admin account' }, { status: 403 });
  }
  
  await connectToDatabase();
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'User email already exists' }, { status: 400 });
    }
    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Customer',
      status: status || 'active'
    });
    
    await newUser.save();
    return NextResponse.json({ success: true, message: 'User account created successfully', user: { id: newUser._id, name, email, role } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
