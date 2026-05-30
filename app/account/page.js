'use client';

import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (!user) return <div className="mx-auto mt-24 max-w-4xl px-6 text-center text-charcoal">Redirecting to login…</div>;

  return (
    <div className="mx-auto mt-16 max-w-6xl px-6 pb-16 md:px-12">
      <div className="glass-card p-10">
        <h1 className="text-4xl font-semibold text-charcoal">Hello, {user.firstName || user.email}</h1>
        <p className="mt-4 text-sm leading-7 text-charcoal/70">Manage your profile, orders, and wishlist from one elegant home.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-sand/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-olive">Role</p>
            <p className="mt-3 text-xl font-semibold text-charcoal">{user.role}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-olive">Email</p>
            <p className="mt-3 text-xl font-semibold text-charcoal">{user.email}</p>
          </div>
          <div className="rounded-[2rem] bg-sand/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-olive">Dashboard</p>
            <p className="mt-3 text-xl font-semibold text-charcoal">View orders, invoices, and analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
