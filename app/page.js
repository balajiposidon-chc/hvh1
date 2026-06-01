import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
export default async function HomePage() {
    await connectToDatabase();
    const products = await Product.find({ status: 'active', featured: true }).limit(6).lean();
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 md:grid-cols-[1.5fr_1fr] items-center rounded-3xl bg-brand-600 p-10 text-white shadow-xl">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-100">HV Ecommerce</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Designed to manage your store and delight customers.</h1>
            <p className="mt-6 max-w-xl text-base text-brand-100">Explore curated products, secure checkout, and a role-based admin dashboard built with Next.js, MongoDB, and NextAuth.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow hover:bg-slate-100">Browse products</Link>
              <Link href="/admin" className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Admin dashboard</Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-lg">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Featured</p>
              <h2 className="mt-4 text-2xl font-semibold">Top products</h2>
              <p className="mt-3 text-sm text-slate-600">Quickly update inventory, manage orders, and keep your storefront optimized for customers.</p>
            </div>
            <div className="grid gap-4">
              {products.map((product) => (<Link key={product._id.toString()} href={`/products/${product.slug}`} className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg hover:bg-slate-800">
                  <p className="text-sm uppercase tracking-[0.24em] text-brand-300">{product.category}</p>
                  <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
                  <p className="mt-2 text-sm text-slate-300 truncate">{product.description}</p>
                </Link>))}
            </div>
          </div>
        </section>
        <section className="mt-16">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Catalog</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Popular products</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all products</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (<ProductCard key={product._id.toString()} product={product}/>))}
          </div>
        </section>
      </main>
      <Footer />
    </div>);
}
