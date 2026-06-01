import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { registerSchema } from '@/lib/validators';
export async function POST(request) {
    try {
        const body = await request.json();
        const parsed = registerSchema.parse(body);
        await connectToDatabase();
        const existing = await User.findOne({ email: parsed.email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ message: 'Email is already registered' }, { status: 400 });
        }
        const hashed = await bcryptjs.hash(parsed.password, 10);
        const user = new User({
            name: parsed.name,
            email: parsed.email.toLowerCase(),
            password: hashed,
            phone: parsed.phone || '',
            address: parsed.address || '',
            role: 'Customer',
            status: 'active',
        });
        await user.save();
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ message: error?.message ?? 'Registration failed' }, { status: 400 });
    }
}
