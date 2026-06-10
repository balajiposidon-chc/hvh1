import AdminLayout from '@/components/AdminLayout';
import AdminUserTable from '@/components/AdminUserTable';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    if (!isSuperAdmin && !permissions.includes('users')) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return (<AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">User management</h1>
        <p className="text-sm text-slate-500">Search, update roles, block accounts, and manage access.</p>
      </div>
      <AdminUserTable users={users.map((user) => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: user.status, createdAt: user.createdAt.toISOString() }))} mainAdminEmail="admin@store.com"/>
    </AdminLayout>);
}
