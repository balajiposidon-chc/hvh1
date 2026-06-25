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
          <a 
            href={storeIdParam ? `/store-panel/products?storeId=${storeIdParam}` : "/store-panel/products"} 
            className="bg-neutral-900 text-white font-extrabold px-8 py-3 text-base rounded-2xl transition-all border border-neutral-700 hover:bg-neutral-800 text-decoration-none flex items-center justify-center gap-2"
          >
            ← Back to Products
          </a>
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
