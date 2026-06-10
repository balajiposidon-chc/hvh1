import AdminLayout from '@/components/AdminLayout';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
function CountCard({ label, value }) {
    return (<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </div>);
}
export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    if (!isSuperAdmin && !permissions.includes('dashboard')) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const orders = await Order.find().lean();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    const recentOrders = orders.slice(0, 5);
    return (<AdminLayout>
      <div className="grid gap-6 xl:grid-cols-4">
        <CountCard label="Total users" value={totalUsers}/>
        <CountCard label="Total products" value={totalProducts}/>
        <CountCard label="Total orders" value={totalOrders}/>
        <CountCard label="Total revenue" value={Math.round(totalRevenue)}/>
      </div>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent orders</h2>
            <p className="text-sm text-slate-500">Latest activity from customers.</p>
          </div>
        </div>
        <div className="grid gap-4">
          {recentOrders.map((order) => (<div key={order._id.toString()} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">Order #{order._id.toString().slice(-6)}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{order.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Total: ${order.total.toFixed(2)}</p>
            </div>))}
        </div>
      </div>
    </AdminLayout>);
}
