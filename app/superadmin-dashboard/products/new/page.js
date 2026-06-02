import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function SuperAdminProductsNewPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['super admin', 'superadmin'].includes(role)) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    return (
      <AdminLayout>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Create Product</h2>
          <p className="text-neutral-500 font-medium">Add a new item to the store catalog.</p>
        </div>
        <div className="bg-white rounded-3xl p-2 border border-neutral-100 shadow-sm">
          <AdminProductForm action="create"/>
        </div>
      </AdminLayout>
    );
}
