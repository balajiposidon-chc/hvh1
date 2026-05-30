"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Store, Receipt, LogOut, Home, User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const rolePrefix = `/${user.role.toLowerCase().replace(' ', '')}`;

  const navItems = [
    { name: 'Dashboard', path: `${rolePrefix}-dashboard`, icon: LayoutDashboard },
    { name: 'Products', path: `${rolePrefix}-products`, icon: Package, roles: ['Super Admin', 'Admin', 'Store Manager'] },
    { name: 'Orders', path: `${rolePrefix}-orders`, icon: ShoppingCart, roles: ['Super Admin', 'Admin', 'Store Manager'] },
    { name: 'Stores', path: `${rolePrefix}-stores`, icon: Store, roles: ['Super Admin'] },
    { name: 'Invoices', path: `${rolePrefix}-invoices`, icon: Receipt, roles: ['Super Admin', 'Accountant'] },
  ];

  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col min-h-screen sticky top-0 shadow-xl z-10">
      <div className="p-6 text-center border-b border-neutral-800">
        <h4 className="text-2xl font-bold text-accent m-0">Hill & Valley</h4>
        <span className="text-neutral-400 text-sm mt-2 block px-3 py-1 bg-neutral-800 rounded-full inline-block">{user.role} Panel</span>
      </div>
      
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user.role)) return null;
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            
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
