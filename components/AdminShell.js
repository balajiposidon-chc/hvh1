import Link from 'next/link';
import { ChevronRight, LayoutDashboard, Package, Settings, ShoppingBag, Users } from 'lucide-react';
export default function AdminShell({ children }) {
    return (<div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white px-4 py-6">
          <div className="mb-8">
            <Link href="/admin" className="text-xl font-semibold text-slate-900">HV Admin</Link>
            <p className="text-sm text-slate-500">Control panel</p>
          </div>
          <nav className="space-y-1 text-slate-700">
            <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100">
              <LayoutDashboard size={18}/> Dashboard
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100">
              <Package size={18}/> Products
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100">
              <Users size={18}/> Users
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100">
              <ShoppingBag size={18}/> Orders
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-100">
              <Settings size={18}/> Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6 xl:px-10">
          <div className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Admin dashboard</p>
              <h1 className="text-2xl font-semibold text-slate-900">Store management</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-2">Admin</span>
              <ChevronRight size={18}/>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>);
}
