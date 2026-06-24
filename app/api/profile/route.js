import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Full Name is required' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, message: 'Phone Number is required' }, { status: 400 });
    }

    // Validate format regex
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return NextResponse.json({ success: false, message: 'Full Name can only contain letters and spaces' }, { status: 400 });
    }

    const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json({ success: false, message: 'Invalid phone number format. Must be 10-15 digits.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check name uniqueness if changed
    const existingUser = await User.findById(session.user.id);
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (existingUser.name.toLowerCase() !== name.trim().toLowerCase()) {
      const nameExists = await User.findOne({ name: { $regex: new RegExp("^" + name.trim() + "$", "i") }, _id: { $ne: session.user.id } });
      if (nameExists) {
        return NextResponse.json({ success: false, message: 'Username is already taken' }, { status: 400 });
      }
    }

    // Parse address
    let parsedAddress = {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    };

    if (typeof address === 'string' && address.trim() !== '') {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        parsedAddress.street = parts.slice(0, parts.length - 3).join(', ');
        parsedAddress.city = parts[parts.length - 3];
        parsedAddress.state = parts[parts.length - 2];
        parsedAddress.zipCode = parts[parts.length - 1];
      } else if (parts.length === 3) {
        parsedAddress.street = parts[0];
        parsedAddress.city = parts[1];
        parsedAddress.state = parts[2];
      } else if (parts.length === 2) {
        parsedAddress.street = parts[0];
        parsedAddress.city = parts[1];
      } else {
        parsedAddress.street = address;
      }
    }

    existingUser.name = name.trim();
    existingUser.phone = phone.trim();
    existingUser.address = parsedAddress;

    await existingUser.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        phone: existingUser.phone,
        address: existingUser.address
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
