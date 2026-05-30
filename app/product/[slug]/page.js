'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import CustomerLayout from '../../../components/CustomerLayout';

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      if (response.ok) setProduct(data.product);
      else router.push('/products');
    }
    load();
  }, [params.slug, router]);

  if (!product) {
    return (
      <CustomerLayout>
        <div className="mx-auto mt-24 max-w-4xl px-6 text-center text-lg text-charcoal/70">
          Loading product details…
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto mt-16 max-w-6xl px-6 pb-16 md:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr]">
          <div className="glass-card overflow-hidden p-0">
            <img src={product.images?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1680000000/spice.jpg'} alt={product.name} className="h-[420px] w-full object-cover" />
            <div className="p-10">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-olive">{product.category}</div>
              <h1 className="mt-4 text-5xl font-semibold text-charcoal">{product.name}</h1>
              <div className="mt-4 flex items-center gap-3 text-sm text-olive">
                <Star size={18} /> {product.rating} • {product.stockQuantity} in stock
              </div>
              <p className="mt-6 max-w-3xl text-base leading-8 text-charcoal/75">{product.description}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl bg-sand/60 p-6">
                  <p className="text-sm text-charcoal/70">Weight</p>
                  <p className="mt-2 text-lg font-semibold text-charcoal">{product.weight}</p>
                </div>
                <div className="rounded-3xl bg-sand/60 p-6">
                  <p className="text-sm text-charcoal/70">GST</p>
                  <p className="mt-2 text-lg font-semibold text-charcoal">{product.gst}%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-10">
            <div className="text-sm text-charcoal/70">Special premium offer</div>
            <div className="mt-4 flex items-end gap-4">
              <p className="text-4xl font-semibold text-forest">₹{product.offerPrice}</p>
              <p className="text-sm text-charcoal/60 line-through">₹{product.price}</p>
            </div>
            <div className="mt-8 space-y-4">
              <button className="w-full rounded-full bg-forest px-6 py-4 text-sm font-semibold text-white transition hover:bg-olive" onClick={() => addToCart(product)}>
                Add to cart
              </button>
              <button className="w-full rounded-full border border-sand px-6 py-4 text-sm font-semibold text-forest transition hover:border-olive" onClick={() => router.push('/checkout')}>
                Checkout now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}
