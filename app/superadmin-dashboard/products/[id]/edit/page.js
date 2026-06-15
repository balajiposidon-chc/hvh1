import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function SuperAdminProductsEditPage({ params }) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role?.toLowerCase();
    const permissions = session?.user?.permissions || [];
    const isSuperAdmin = role === 'super admin' || role === 'superadmin';
    if (!isSuperAdmin && !permissions.includes('products')) {
        return <div className="p-12 text-center">Access denied</div>;
    }
    await connectToDatabase();
    const product = await Product.findById(params.id).lean();
    if (!product) {
        return <div className="p-12 text-center">Product not found</div>;
    }
    return (
      <AdminLayout>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Edit Product</h2>
            <p className="text-neutral-500 font-medium">Update pricing, catalog info, and stock variables.</p>
          </div>
          <Link 
            href="/superadmin-dashboard/products" 
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
                hsnCode: product.hsnCode || '',
                gstRate: product.gstRate !== undefined ? product.gstRate.toString() : '5',
            }}/>
        </div>
      </AdminLayout>
    );
}

