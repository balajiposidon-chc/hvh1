"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import Button from '@/components/Button';
import Input from '@/components/Input';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        setLoading(false);
        if (result?.error) {
            setError(result.error);
        }
        else {
            window.location.href = '/profile';
        }
    };
    return (<div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Login to your account</h1>
          <p className="mt-2 text-sm text-slate-600">Access your profile, orders, and checkout securely.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>
          <p className="mt-6 text-sm text-slate-600">
            Don&apos;t have an account? <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">Create one</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>);
}
