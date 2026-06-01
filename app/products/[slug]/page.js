import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
export default async function ProductDetailsPage({ params }) {
    await connectToDatabase();
    const product = await Product.findOne({ slug: params.slug, status: 'active' }).lean();
    if (!product) {
        return (<div>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Product not found</h1>
          <p className="mt-4 text-slate-600">Check the catalog or search for a different product.</p>
          <Link href="/products" className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 text-white">Back to products</Link>
        </main>
        <Footer />
      </div>);
    }
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-6 overflow-hidden rounded-3xl bg-slate-100">
              <img src={product.images?.[0] ?? '/placeholder.png'} alt={product.name} className="h-96 w-full object-cover"/>
            </div>
            <div>
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">{product.category}</span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">{product.name}</h1>
              <p className="mt-4 text-slate-600">{product.description}</p>
              <div className="mt-6 flex items-center gap-4 text-3xl font-semibold text-slate-900">
                <span>${product.discountPrice > 0 ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}</span>
                {product.discountPrice > 0 && <span className="text-sm text-slate-500 line-through">${product.price.toFixed(2)}</span>}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Details</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Brand: {product.brand}</p>
                <p>Stock: {product.stock}</p>
                <p>Status: {product.status}</p>
              </div>
              <button className="mt-6 w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">Add to cart</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>);
}
