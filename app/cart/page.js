'use client';

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/CustomerLayout';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);

  if (!cart.length) {
    return (
      <CustomerLayout>
        <div className="mx-auto mt-24 max-w-4xl px-6 text-center text-charcoal">
          <h1 className="text-4xl font-semibold">Your cart is empty</h1>
          <p className="mt-4 text-sm text-charcoal/70">Add premium products to your cart and continue your organic shopping journey.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest">
            Browse products
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mx-auto mt-16 max-w-7xl px-6 pb-16 md:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-semibold text-charcoal">Shopping cart</h1>
            <div className="mt-8 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="rounded-[2rem] border border-sand bg-white/90 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-charcoal">{item.name}</h2>
                      <p className="mt-2 text-sm text-charcoal/70">{item.quantity} × ₹{item.offerPrice}</p>
                    </div>
                    <button className="rounded-full border border-sand px-4 py-2 text-sm text-charcoal transition hover:border-olive" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-charcoal">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-charcoal/70"><span>Subtotal</span><span>₹{total}</span></div>
              <div className="flex items-center justify-between text-sm text-charcoal/70"><span>Estimated tax</span><span>₹{Math.round(total * 0.05)}</span></div>
              <div className="flex items-center justify-between text-lg font-semibold text-charcoal"><span>Total</span><span>₹{Math.round(total * 1.05)}</span></div>
            </div>
            <div className="mt-8 space-y-3">
              <Link href="/checkout" className="block rounded-full bg-forest px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-olive">Proceed to checkout</Link>
              <button className="w-full rounded-full border border-sand px-6 py-4 text-sm font-semibold text-charcoal transition hover:border-olive" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
