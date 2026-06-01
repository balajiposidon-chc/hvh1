import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminProductsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    const products = await Product.find().sort({ updatedAt: -1 }).lean();
    return (<AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Product management</h1>
          <p className="text-sm text-slate-500">Create, update, and manage inventory.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">New product</Link>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-600">Name</th>
              <th className="px-6 py-4 font-medium text-slate-600">Price</th>
              <th className="px-6 py-4 font-medium text-slate-600">Stock</th>
              <th className="px-6 py-4 font-medium text-slate-600">Status</th>
              <th className="px-6 py-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (<tr key={product._id.toString()} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">{product.name}</td>
                <td className="px-6 py-4 text-slate-900">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-900">{product.stock}</td>
                <td className="px-6 py-4 text-slate-900">{product.status}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/products/${product._id.toString()}/edit`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">Edit</Link>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </AdminShell>);
}
