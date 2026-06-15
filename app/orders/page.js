import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import OrderActions from '@/components/OrderActions';

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return (<div>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Unauthorized</h1>
          <p className="mt-4 text-slate-600">Please sign in to view your orders.</p>
        </main>
        <Footer />
      </div>);
    }
    await connectToDatabase();
    const orders = await Order.find({ user: session.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      user: order.user ? {
        _id: order.user._id ? order.user._id.toString() : null,
        name: order.user.name || session.user.name,
        email: order.user.email || session.user.email
      } : {
        name: session.user.name,
        email: session.user.email
      },
      store: order.store ? order.store.toString() : null,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
      orderItems: order.orderItems ? order.orderItems.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : undefined,
        product: item.product ? item.product.toString() : undefined
      })) : []
    }));

    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">My orders</h1>
          <p className="mt-2 text-slate-600">Track your order history and statuses.</p>
          <div className="mt-8 space-y-4">
            {serializedOrders.length === 0 ? (<div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">No orders yet.</div>) : (serializedOrders.map((order) => (<div key={order._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Order</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">#ORD-{order._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">{order.status}</div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Placed</p>
                      <p className="mt-1 text-slate-900">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="mt-1 text-slate-900">₹{(order.totalPrice ?? order.total ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <OrderActions order={order} />
                </div>)))}
          </div>
        </div>
      </main>
      <Footer />
    </div>);
}
