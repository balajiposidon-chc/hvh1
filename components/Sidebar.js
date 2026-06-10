"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Store, Receipt, LogOut, Home, User, FileText, ArrowLeft, Settings, X } from 'lucide-react';

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, permissions = [] } = useAuth();

  if (!user) return null;

  const storeId = searchParams.get('storeId');
  const isStorePanel = pathname.startsWith('/store-panel');
  const roleLower = user.role ? user.role.toLowerCase() : '';
  const isSuperAdmin = roleLower === 'super admin' || roleLower === 'superadmin';

  let navItems = [];

  if (isStorePanel) {
    navItems = [
      { name: 'Store Overview', path: '/store-panel', icon: LayoutDashboard },
      { name: 'Products Catalog', path: '/store-panel/products', icon: Package },
      { name: 'Fulfillment Orders', path: '/store-panel/orders', icon: ShoppingCart },
      { name: 'Accounting Ledger', path: '/store-panel/accounting', icon: Receipt },
      { name: 'Store Settings', path: '/store-panel/settings', icon: Settings },
    ];
  } else {
    // Map all possible navItems to their corresponding permission requirement
    const allNavItems = [
      { name: 'Dashboard', path: user.role === 'Super Admin' ? '/superadmin-dashboard' : '/admin', icon: LayoutDashboard, permission: 'dashboard' },
      { name: 'Products', path: user.role === 'Super Admin' ? '/superadmin-dashboard/products' : '/admin/products', icon: Package, permission: 'products' },
      { name: 'Orders', path: user.role === 'Super Admin' ? '/superadmin-dashboard/orders' : '/admin/orders', icon: ShoppingCart, permission: 'orders' },
      { name: 'Stores', path: '/superadmin-dashboard/stores', icon: Store, permission: 'stores' },
      { name: 'Accounting', path: '/superadmin-dashboard/accounting', icon: Receipt, permission: 'accounting' },
      { name: 'Users', path: user.role === 'Super Admin' ? '/superadmin-dashboard/users' : '/admin/users', icon: User, permission: 'users' },
      { name: 'Role Manager', path: '/superadmin-dashboard/roles', icon: User, permission: 'rbac' },
      { name: 'Audit Panel', path: '/superadmin-dashboard/audit', icon: FileText, permission: 'rbac' },
      { name: 'Settings', path: user.role === 'Super Admin' ? '/superadmin-dashboard/settings' : '/admin/settings', icon: Store, permission: 'settings' },
    ];

    // Filter based on active user permissions (Super Admins bypass filtering and see all options)
    navItems = allNavItems.filter(item => {
      return isSuperAdmin || permissions.includes(item.permission);
    });
  }

  return (
    <div className="w-64 bg-neutral-900 text-white flex flex-col h-screen sticky top-0 shadow-xl z-10">
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Hill & Valley" className="rounded-full object-cover" style={{ height: '35px', width: '35px' }} />
            <h4 className="text-xl font-bold text-white m-0" style={{ fontFamily: "'Playfair Display', serif" }}>Hill & Valley</h4>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors border-0 bg-transparent md:hidden cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <span className="text-white/80 text-xs px-2.5 py-1 bg-neutral-800 rounded-full inline-block mt-1 font-medium">{isStorePanel ? 'Store' : user.role} Panel</span>
      </div>
      
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {isStorePanel && isSuperAdmin && (
            <li className="mb-4">
              <Link 
                href="/superadmin-dashboard/stores"
                onClick={() => onClose && onClose()}
                className="text-decoration-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 bg-neutral-800 text-amber-400 border border-neutral-700 hover:bg-neutral-750"
              >
                <ArrowLeft className="w-5 h-5 text-amber-400" />
                <span className="font-bold">Back to Super Admin</span>
              </Link>
            </li>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const itemPath = storeId ? `${item.path}?storeId=${storeId}` : item.path;
            const isActive = pathname === item.path || (item.path !== '/admin' && item.path !== '/superadmin-dashboard' && item.path !== '/store-panel' && pathname.startsWith(item.path));
            
            return (
              <li key={item.name}>
                <Link 
                  href={itemPath} 
                  onClick={() => onClose && onClose()}
                  className={`text-decoration-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-white hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80'}`} />
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
              <p className="text-xs text-white/70">{user.email}</p>
            </div>
          </div>
          <Link href="/" onClick={() => onClose && onClose()} className="text-decoration-none flex items-center gap-2 text-sm text-white hover:text-accent transition-colors py-2 border-t border-neutral-700/50">
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
