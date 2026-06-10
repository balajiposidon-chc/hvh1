export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Role from '@/models/Role';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleName = searchParams.get('role');
    
    if (!roleName) {
      return NextResponse.json({ success: true, permissions: [] });
    }
    
    await connectToDatabase();
    const role = await Role.findOne({ name: roleName });
    if (role) {
      return NextResponse.json({ success: true, permissions: role.permissions });
    }
    
    // Default roles permissions fallback
    let permissions = [];
    const r = roleName.toLowerCase();
    if (r === 'super admin' || r === 'superadmin') {
      permissions = ['dashboard', 'products', 'orders', 'stores', 'accounting', 'users', 'settings', 'rbac', 'store-panel'];
    } else if (r === 'admin') {
      permissions = ['dashboard', 'products', 'orders', 'users', 'settings'];
    } else if (r === 'store manager' || r === 'manager') {
      permissions = ['dashboard', 'products', 'orders', 'store-panel'];
    } else if (r === 'accountant') {
      permissions = ['accounting'];
    } else if (r === 'customer') {
      permissions = [];
    } else {
      // In case some user has a custom role without a record, default to customer (empty)
      permissions = [];
    }
    
    return NextResponse.json({ success: true, permissions });
  } catch (err) {
    console.error("Error fetching permissions:", err);
    return NextResponse.json({ success: false, permissions: [], error: err.message }, { status: 500 });
  }
}
