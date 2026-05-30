'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useForm } from 'react-hook-form';
import CustomerLayout from '../../components/CustomerLayout';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { register, handleSubmit } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);

  useEffect(() => {
    if (!cart.length) setSubmitted(false);
  }, [cart.length]);

  const onSubmit = async (data) => {
    setSubmitted(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        products: cart.map((item) => ({ product: item.id, quantity: item.quantity, price: item.offerPrice })),
        subtotal: total,
        tax: Math.round(total * 0.05),
        shipping: 50,
        total: Math.round(total * 1.05) + 50,
        paymentStatus: 'pending'
      })
    });
    clearCart();
  };

  if (!cart.length) {
    return (
      <CustomerLayout>
        <div className="mx-auto mt-24 max-w-4xl px-6 text-center text-charcoal">
          Add items to the cart before checking out.
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mx-auto mt-16 max-w-5xl px-6 pb-16 md:px-12">
        <div className="glass-card p-10">
          <h1 className="text-4xl font-semibold text-charcoal">Checkout</h1>
          <p className="mt-3 text-sm leading-7 text-charcoal/70">Complete your order with secure billing and premium delivery.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-sm text-charcoal/80">Full name</label>
              <input type="text" {...register('name')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none focus:border-olive" />
              <label className="block text-sm text-charcoal/80">Email address</label>
              <input type="email" {...register('email')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none focus:border-olive" />
            </div>
            <label className="block text-sm text-charcoal/80">Shipping address</label>
            <textarea {...register('address')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none focus:border-olive" rows="4" />
            <div className="rounded-[2rem] bg-forest/5 p-6">
              <p className="text-sm text-forest">Order total</p>
              <p className="mt-2 text-3xl font-semibold text-charcoal">₹{Math.round(total * 1.05) + 50}</p>
            </div>
            <button type="submit" className="w-full rounded-full bg-forest px-6 py-4 text-sm font-semibold text-white transition hover:bg-olive">Place order</button>
            {submitted && <p className="text-sm text-olive">Order placed successfully. Check your dashboard for details.</p>}
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}
