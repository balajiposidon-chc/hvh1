import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
export default async function ProductsPage({ searchParams }) {
    await connectToDatabase();
    const query = { status: 'active' };
    if (searchParams.category)
        query.category = searchParams.category;
    if (searchParams.q)
        query.name = { $regex: searchParams.q, $options: 'i' };
    const products = await Product.find(query).limit(40).lean();
    const categories = await Product.distinct('category');
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Products</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Browse our catalog</h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <form action="/products" className="flex items-center gap-2">
                <input type="text" name="q" defaultValue={searchParams.q ?? ''} placeholder="Search products" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"/>
                <button type="submit" className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">Search</button>
              </form>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/products" className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-100">All</Link>
                  {categories.map((category) => (<Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-100">
                      {category}
                    </Link>))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (<ProductCard key={product._id.toString()} product={product}/>))}
        </div>
      </main>
      <Footer />
    </div>);
}
