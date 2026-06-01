"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Store, Receipt, LogOut, Home, User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  let navItems = [];

  if (user.role === 'Super Admin') {
    navItems = [
      { name: 'Dashboard', path: '/superadmin-dashboard', icon: LayoutDashboard },
      { name: 'Products', path: '/superadmin-dashboard/products', icon: Package },
      { name: 'Orders', path: '/superadmin-dashboard/orders', icon: ShoppingCart },
      { name: 'Stores', path: '/superadmin-dashboard/stores', icon: Store },
      { name: 'Accounting', path: '/superadmin-dashboard/accounting', icon: Receipt },
    ];
  } else if (user.role === 'Admin' || user.role === 'Store Manager') {
    navItems = [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Products', path: '/admin/products', icon: Package },
      { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { name: 'Settings', path: '/admin/settings', icon: Store },
    ];
    if (user.role === 'Admin') {
      navItems.push({ name: 'Users', path: '/admin/users', icon: User });
    }
  } else if (user.role === 'Accountant') {
    navItems = [
      { name: 'Accounting', path: '/superadmin-dashboard/accounting', icon: Receipt },
    ];
  }

  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col min-h-screen sticky top-0 shadow-xl z-10">
      <div className="p-6 text-center border-b border-neutral-800">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <img src="/logo.jpg" alt="Hill & Valley" className="rounded-full object-cover" style={{ height: '35px', width: '35px' }} />
          <h4 className="text-2xl font-bold text-accent m-0" style={{ fontFamily: "'Playfair Display', serif" }}>Hill & Valley</h4>
        </div>
        <span className="text-neutral-400 text-sm mt-2 block px-3 py-1 bg-neutral-800 rounded-full inline-block">{user.role} Panel</span>
      </div>
      
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/admin' && item.path !== '/superadmin-dashboard' && pathname.startsWith(item.path));
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-neutral-800">
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-accent transition-colors py-2 border-t border-neutral-700/50">
            <Home className="w-4 h-4" /> Go to Storefront
          </Link>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
