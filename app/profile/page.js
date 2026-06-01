import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return (<div>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Unauthorized</h1>
          <p className="mt-4 text-slate-600">You need to sign in to view your profile.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-white">Sign in</Link>
        </main>
        <Footer />
      </div>);
    }
    await connectToDatabase();
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">My profile</h1>
          <p className="mt-2 text-slate-600">Manage your account details and see recent activity.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{session.user.name}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Order history</h2>
            {orders.length === 0 ? (<p className="mt-4 text-slate-600">You do not have any orders yet.</p>) : (<div className="mt-4 grid gap-4">
                {orders.map((order) => (<div key={order._id.toString()} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Order placed {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Total: ${order.total.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-slate-600">Status: {order.status}</p>
                  </div>))}
              </div>)}
          </div>
        </div>
      </main>
      <Footer />
    </div>);
}
