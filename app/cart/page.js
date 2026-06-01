"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
export default function CartPage() {
    const [items, setItems] = useState([]);
    useEffect(() => {
        const stored = window.localStorage.getItem('hv-cart');
        if (stored) {
            setItems(JSON.parse(stored));
        }
    }, []);
    useEffect(() => {
        window.localStorage.setItem('hv-cart', JSON.stringify(items));
    }, [items]);
    const updateQuantity = (id, quantity) => {
        setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item));
    };
    const removeItem = (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900">Shopping cart</h1>
        {items.length === 0 ? (<div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-xl font-medium text-slate-900">Your cart is empty.</p>
            <Link href="/products" className="mt-4 inline-flex rounded-full bg-brand-600 px-6 py-3 text-white">Browse products</Link>
          </div>) : (<div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-4">
              {items.map((item) => (<div key={item.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover"/>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    <p className="mt-2 text-sm text-slate-600">${item.price.toFixed(2)} each</p>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-slate-600">Qty</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.id, Number(e.target.value))} className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm"/>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-rose-600 hover:text-rose-700" onClick={() => removeItem(item.id)}>Remove</button>
                </div>))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Items: {items.length}</p>
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                <p>Estimated shipping: $10.00</p>
                <p>Total: ${(subtotal + 10).toFixed(2)}</p>
              </div>
              <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700">Proceed to checkout</Link>
            </div>
          </div>)}
      </main>
      <Footer />
    </div>);
}
