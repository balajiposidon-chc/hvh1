import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import OTP from '@/lib/models/OTP';
import { registerSchema } from '@/lib/validators';

export async function POST(request) {
    try {
        const body = await request.json();
        const parsed = registerSchema.parse(body);
        await connectToDatabase();

        // Verify OTP code
        const activeOtp = await OTP.findOne({ email: parsed.email.toLowerCase() });
        if (!activeOtp || activeOtp.code !== parsed.otp) {
            return NextResponse.json({ message: 'Invalid or expired OTP code' }, { status: 400 });
        }

        const existing = await User.findOne({ email: parsed.email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ message: 'Email is already registered' }, { status: 400 });
        }
        if (parsed.name) {
            const nameExists = await User.findOne({ name: { $regex: new RegExp("^" + parsed.name.trim() + "$", "i") } });
            if (nameExists) {
                return NextResponse.json({ message: 'Username is already taken' }, { status: 400 });
            }
        }
        if (parsed.phone && parsed.phone.trim() !== '') {
            const phoneExists = await User.findOne({ phone: parsed.phone.trim() });
            if (phoneExists) {
                return NextResponse.json({ message: 'Phone number is already registered' }, { status: 400 });
            }
        }
        let parsedAddress = {
            street: parsed.address || '',
            city: '',
            state: '',
            zipCode: ''
        };
        if (typeof parsed.address === 'string' && parsed.address.trim() !== '') {
            const parts = parsed.address.split(',').map(p => p.trim());
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
            }
        }

        // Delete the verified OTP record to prevent reuse
        await OTP.deleteOne({ _id: activeOtp._id });

        const hashed = await bcryptjs.hash(parsed.password, 10);
        const user = new User({
            name: parsed.name,
            email: parsed.email.toLowerCase(),
            password: hashed,
            phone: parsed.phone || '',
            address: parsedAddress,
            role: 'Customer',
            status: 'active',
        });
        await user.save();
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    }
    catch (error) {
        if (error.errors && Array.isArray(error.errors)) {
            const msg = error.errors.map(err => err.message).join(', ');
            return NextResponse.json({ message: msg }, { status: 400 });
        }
        return NextResponse.json({ message: error?.message ?? 'Registration failed' }, { status: 400 });
    }
}
