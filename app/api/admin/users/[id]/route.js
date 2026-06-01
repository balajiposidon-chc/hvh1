import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();
    const user = await User.findById(params.id);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (body.role)
        user.role = body.role;
    if (body.status)
        user.status = body.status;
    await user.save();
    return NextResponse.json({ message: 'User updated' });
}
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    await connectToDatabase();
    const user = await User.findById(params.id);
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.email === 'admin@store.com') {
        return NextResponse.json({ message: 'Main admin cannot be deleted' }, { status: 403 });
    }
    await user.deleteOne();
    return NextResponse.json({ message: 'User deleted' });
}
