import AdminLayout from '@/components/AdminLayout';
import AdminProductForm from '@/components/AdminProductForm';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
export default async function AdminProductsEditPage({ params }) {
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
    return (<AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
        <p className="text-sm text-slate-500">Update product details and inventory.</p>
      </div>
      <AdminProductForm action="update" initialData={{
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price.toString(),
            discountPrice: product.discountPrice.toString(),
            category: product.category,
            brand: product.brand,
            stock: product.stock.toString(),
            images: product.images.join(', '),
            status: product.status,
            featured: product.featured,
            hsnCode: product.hsnCode || '',
            gstRate: product.gstRate !== undefined ? product.gstRate.toString() : '5',
            culinaryUses: product.culinaryUses || '',
            storageCare: product.storageCare || '',
            sourcingGuarantee: product.sourcingGuarantee || '',
            allergenSafety: product.allergenSafety || '',
        }}/>
    </AdminLayout>);
}
