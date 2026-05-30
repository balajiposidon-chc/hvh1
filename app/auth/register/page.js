'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ToastContainer } from 'react-toastify';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const ok = await registerUser(data);
    if (ok) router.push('/auth/login');
  };

  return (
    <div className="mx-auto mt-16 max-w-3xl px-6 py-12 md:px-12">
      <ToastContainer />
      <div className="glass-card p-10">
        <h1 className="text-4xl font-semibold text-charcoal">Create your Hill & Valley account</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-charcoal/70">Register now to save favorites, manage orders, and join our premium regional commerce platform.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-charcoal/80">First name</label>
              <input type="text" {...register('firstName')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80">Last name</label>
              <input type="text" {...register('lastName')} className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
            </div>
          </div>
          <label className="block text-sm font-medium text-charcoal/80">Email</label>
          <input type="email" {...register('email')} required className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
          <label className="block text-sm font-medium text-charcoal/80">Password</label>
          <input type="password" {...register('password')} required minLength={8} className="w-full rounded-3xl border border-sand bg-sand/50 px-5 py-4 text-sm outline-none transition focus:border-olive" />
          <button type="submit" className="w-full rounded-full bg-forest px-5 py-4 text-sm font-semibold text-white transition hover:bg-olive">Create account</button>
        </form>
        <p className="mt-8 text-sm text-charcoal/70">Already registered? <Link href="/auth/login" className="font-semibold text-forest hover:text-olive">Sign in</Link></p>
      </div>
    </div>
  );
}
