import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  if (!role || !['admin', 'super admin', 'superadmin'].includes(role)) {
    return false;
  }
  return true;
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
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  const { name, email, password, role, status } = body;
  
  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: 'Name, email, and password are required' }, { status: 400 });
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
