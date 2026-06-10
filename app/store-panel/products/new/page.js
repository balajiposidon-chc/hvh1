"use client";

import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function StoreProductsNewPageContent() {
    const { user, permissions = [] } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const storeIdParam = searchParams.get('storeId');

    useEffect(() => {
        if (user) {
            const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
            if (!isSuperAdmin && !permissions.includes('store-panel')) {
                router.push('/unauthorized');
            }
        }
    }, [user, permissions, router]);

    const isSuperAdmin = user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'superadmin';
    if (!user || (!permissions.includes('store-panel') && !isSuperAdmin)) return null;

    return (
      <AdminLayout>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Create Product</h2>
            <p className="text-neutral-500 font-medium">Add a new item to your outlet catalog.</p>
          </div>
          <Link 
            href={storeIdParam ? `/store-panel/products?storeId=${storeIdParam}` : "/store-panel/products"} 
            className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-all text-sm text-decoration-none"
          >
            ← Back to Products
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-2 border border-neutral-100 shadow-sm">
          <AdminProductForm action="create" initialData={{ store: storeIdParam || '' }}/>
        </div>
      </AdminLayout>
    );
}

export default function StoreProductsNewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Create Page...</p>
      </div>
    }>
      <StoreProductsNewPageContent />
    </Suspense>
  );
}
