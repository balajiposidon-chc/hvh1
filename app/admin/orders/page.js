import AdminLayout from '@/components/AdminLayout';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminOrdersPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return (<AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Order management</h1>
        <p className="text-sm text-slate-500">Review orders and update statuses.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-600">Order</th>
              <th className="px-6 py-4 font-medium text-slate-600">Total</th>
              <th className="px-6 py-4 font-medium text-slate-600">Status</th>
              <th className="px-6 py-4 font-medium text-slate-600">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {orders.map((order) => (<tr key={order._id.toString()} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">#{order._id.toString().slice(-6)}</td>
                <td className="px-6 py-4 text-slate-900">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-900">{order.status}</td>
                <td className="px-6 py-4 text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </AdminLayout>);
}
