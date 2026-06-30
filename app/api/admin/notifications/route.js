export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role?.toLowerCase();
    const permissions = session.user.permissions || [];
    const isSuperAdmin = ['super admin', 'superadmin'].includes(role) || permissions.includes('rbac');

    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    await Notification.updateMany({ read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
