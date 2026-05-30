import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card overflow-hidden">
      <div className="relative overflow-hidden rounded-[2rem] bg-sand/50">
        <img src={product.image} alt={product.name} className="h-72 w-full object-cover transition duration-500 hover:scale-105" />
        <div className="absolute right-4 top-4 rounded-full bg-white/80 p-3 text-forest shadow-md">
          <Heart size={18} />
        </div>
      </div>
      <div className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-olive/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-forest">{product.category}</span>
          <div className="inline-flex items-center gap-1 text-sm text-olive">
            <Star size={14} /> {product.rating}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-charcoal">{product.name}</h3>
        <p className="mt-3 text-sm leading-7 text-charcoal/70">{product.description}</p>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-charcoal/60">From</p>
            <p className="text-2xl font-semibold text-forest">₹{product.offerPrice}</p>
          </div>
          <Link href={`/product/${product.slug}`} className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-olive">
            View
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
