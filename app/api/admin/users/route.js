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
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user;
    const roleCheck = loggedInUser?.role?.toLowerCase();
    const isSuperAdmin = roleCheck === 'super admin' || roleCheck === 'superadmin';

    const users = await User.find().sort({ createdAt: -1 }).lean();

    const sanitizedUsers = users.map(u => {
      const isSelf = String(u._id) === String(loggedInUser?.id || loggedInUser?._id);
      if (isSuperAdmin || isSelf) {
        return u;
      }
      return {
        ...u,
        email: '[HIDDEN]',
        phone: u.phone ? '[HIDDEN]' : undefined
      };
    });

    return NextResponse.json({ success: true, users: sanitizedUsers });
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
  const { 
    name, 
    email, 
    password, 
    role, 
    status, 
    phone,
    address,
    bloodGroup,
    idProofNumber,
    idProofImage,
    profileImage 
  } = body;
  
  if (!name || !email || !password || !phone || !bloodGroup || !idProofNumber || !idProofImage || !profileImage) {
    return NextResponse.json({ success: false, message: 'All fields (Name, Email, Password, Phone, Blood Group, ID Proof Number, ID Proof Image, Profile Image) are required.' }, { status: 400 });
  }

  if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
    return NextResponse.json({ success: false, message: 'Complete address details (Street, City, State, Zip Code) are required.' }, { status: 400 });
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

    if (name) {
      const nameExists = await User.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") } });
      if (nameExists) {
        return NextResponse.json({ success: false, message: 'Username is already taken' }, { status: 400 });
      }
    }

    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        return NextResponse.json({ success: false, message: 'Phone number must be exactly 10 digits (numbers only)' }, { status: 400 });
      }
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return NextResponse.json({ success: false, message: 'Phone number is already registered' }, { status: 400 });
      }
    }
    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone.trim(),
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zipCode: address.zipCode.trim()
      },
      bloodGroup: bloodGroup.trim(),
      idProofNumber: idProofNumber.trim(),
      idProofImage,
      profileImage,
      role: role || 'Customer',
      status: status || 'active'
    });
    
    await newUser.save();
    return NextResponse.json({ success: true, message: 'User account created successfully', user: { id: newUser._id, name, email, role } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
