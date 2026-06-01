import Link from 'next/link';
export default function ProductCard({ product }) {
    return (<article className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block h-48 overflow-hidden bg-slate-100">
        <img src={product.images?.[0] ?? '/placeholder.png'} alt={product.name} className="h-full w-full object-cover"/>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`} className="text-lg font-semibold text-slate-900 hover:text-brand-600">
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>${product.discountPrice > 0 ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-[0.08em] text-slate-500">
            {product.category}
          </span>
        </div>
      </div>
    </article>);
}
