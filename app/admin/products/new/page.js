import AdminShell from '@/components/AdminShell';
import AdminProductForm from '@/components/AdminProductForm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminProductsNewPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    return (<AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Create product</h1>
        <p className="text-sm text-slate-500">Add a new item to the catalog.</p>
      </div>
      <AdminProductForm action="create"/>
    </AdminShell>);
}
