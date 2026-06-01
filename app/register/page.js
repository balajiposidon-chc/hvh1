"use client";
import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import Button from '@/components/Button';
import Input from '@/components/Input';
export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, address }),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
            setError(data.message || 'Unable to register');
            return;
        }
        setMessage('Account created successfully. You may now log in.');
    };
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Register as a customer to start shopping today.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} required/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)}/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Address</span>
              <Input value={address} onChange={(e) => setAddress(e.target.value)}/>
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Create account'}</Button>
          </form>
          <p className="mt-6 text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>);
}
