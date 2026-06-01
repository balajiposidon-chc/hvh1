"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import Button from '@/components/Button';
export default function CheckoutPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState([]);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const stored = window.localStorage.getItem('hv-cart');
        if (stored)
            setItems(JSON.parse(stored));
    }, []);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 10;
    const tax = Number(((subtotal * 0.05) ?? 0).toFixed(2));
    const total = subtotal + shippingFee + tax;
    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        if (!session) {
            setError('Please log in before checking out.');
            return;
        }
        if (!address || !phone) {
            setError('Shipping address and phone are required.');
            return;
        }
        if (items.length === 0) {
            setError('Your cart is empty.');
            return;
        }
        setLoading(true);
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, phone, items, subtotal, tax, shippingFee, total }),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
            setError(data.message || 'Unable to place order');
            return;
        }
        setMessage('Order placed successfully.');
        setItems([]);
        window.localStorage.removeItem('hv-cart');
    };
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
          {!session ? (<div className="mt-6 rounded-3xl bg-slate-50 p-6 text-slate-700">
              <p className="text-base">You need to be logged in to complete checkout.</p>
              <Link href="/login" className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-3 text-white">Login now</Link>
            </div>) : items.length === 0 ? (<div className="mt-6 rounded-3xl bg-slate-50 p-6 text-slate-700">
              <p>Your cart is empty.</p>
              <Link href="/products" className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-3 text-white">Browse products</Link>
            </div>) : (<form onSubmit={handlePlaceOrder} className="mt-8 space-y-6">
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shipping</p>
                <label className="block text-sm text-slate-700">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Street, city, postal code" required/>
                <label className="block text-sm text-slate-700">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" placeholder="Phone number" required/>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-700">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-700">
                  <span>Shipping</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Placing order...' : 'Place order'}</Button>
            </form>)}
        </div>
      </main>
      <Footer />
    </div>);
}
