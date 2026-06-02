import Link from 'next/link';
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
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Create Product</h2>
            <p className="text-neutral-500 font-medium">Add a new item to the store catalog.</p>
          </div>
          <Link 
            href="/superadmin-dashboard/products" 
            className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-all text-sm text-decoration-none"
          >
            ← Back to Products
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-2 border border-neutral-100 shadow-sm">
          <AdminProductForm action="create"/>
        </div>
      </AdminLayout>
    );
}

