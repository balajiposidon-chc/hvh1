'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const onSubmit = async (data) => {
    const ok = await login(data);
    if (ok) router.push('/account');
  };

  return (
    <div className="mx-auto mt-16 max-w-3xl px-6 py-12 md:px-12">
      <ToastContainer />
      <div className="glass-card p-10">
        <h1 className="text-4xl font-semibold text-charcoal">Secure login</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-charcoal/70">Access your Hill & Valley workspace, orders, and premium account tools securely.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
          <label className="block text-sm font-medium text-charcoal/80">Email</label>
          <input type="email" {...register('email')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
          <label className="block text-sm font-medium text-charcoal/80">Password</label>
          <input type="password" {...register('password')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
          <button type="submit" className="w-full rounded-full bg-forest px-5 py-4 text-sm font-semibold text-white transition hover:bg-olive">Sign in</button>
        </form>
        <p className="mt-8 text-sm text-charcoal/70">New to Hill & Valley? <Link href="/auth/register" className="font-semibold text-forest hover:text-olive">Create account</Link></p>
      </div>
    </div>
  );
}
