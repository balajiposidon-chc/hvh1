import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminProductsNewPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    if (!isSuperAdmin && !permissions.includes('products')) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    return (<AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Create product</h1>
        <p className="text-sm text-slate-500">Add a new item to the catalog.</p>
      </div>
      <AdminProductForm action="create"/>
    </AdminLayout>);
}
