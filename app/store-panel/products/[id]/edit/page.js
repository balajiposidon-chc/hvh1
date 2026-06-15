import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Store from '@/models/Store';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function StoreProductsEditPage({ params, searchParams }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const storeIdParam = searchParams?.storeId;
    
    // Check role boundaries
    if (!role || !['manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
        return <div className="p-12 text-center font-bold text-red-500">Access denied</div>;
    }
    
    await connectToDatabase();
    const product = await Product.findById(params.id).lean();
    if (!product) {
        return <div className="p-12 text-center font-bold">Product not found</div>;
    }

    // Scope check: Ensure the manager belongs to this store product
    if (role === 'store manager' || role === 'manager') {
        const userStore = await Store.findOne({ manager: session.user.id });
        if (!userStore || product.store?.toString() !== userStore._id.toString()) {
            return <div className="p-12 text-center font-bold text-red-500">Unauthorized: Product belongs to another store</div>;
        }
    }

    return (
      <AdminLayout>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Edit Product</h2>
            <p className="text-neutral-500 font-medium">Update pricing, catalog info, and stock variables.</p>
          </div>
          <Link 
            href={storeIdParam ? `/store-panel/products?storeId=${storeIdParam}` : "/store-panel/products"} 
            className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-all text-sm text-decoration-none"
          >
            ← Back to Products
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-2 border border-neutral-100 shadow-sm">
          <AdminProductForm action="update" initialData={{
                id: product._id.toString(),
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price.toString(),
                discountPrice: product.discountPrice ? product.discountPrice.toString() : '0',
                category: product.categoryName || '',
                brand: product.brand || 'Hill & Valley',
                stock: product.stock.toString(),
                images: product.images ? product.images.join(', ') : '',
                status: product.status || 'active',
                featured: product.featured || false,
                store: product.store ? product.store.toString() : (storeIdParam || ''),
                hsnCode: product.hsnCode || '',
                gstRate: product.gstRate !== undefined ? product.gstRate.toString() : '5',
                culinaryUses: product.culinaryUses || '',
                storageCare: product.storageCare || '',
                sourcingGuarantee: product.sourcingGuarantee || '',
                allergenSafety: product.allergenSafety || '',
            }}/>
        </div>
      </AdminLayout>
    );
}
