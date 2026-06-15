'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalyticsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data);
    }
    loadStats();
  }, []);

  if (!stats) {
    return <div className="rounded-[2rem] bg-white/90 p-10 shadow-soft">Loading dashboard…</div>;
  }

  const chartData = stats.storePerformance.map((store) => ({ name: store.name, revenue: store.revenue }));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-4">
        {[
          { label: 'Total Sales', value: `₹${stats.totalSales}` },
          { label: 'Revenue', value: `₹${stats.revenue}` },
          { label: 'Orders', value: stats.orders },
          { label: 'Customers', value: stats.customers }
        ].map((item) => (
          <div key={item.label} className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-olive">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-charcoal">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-charcoal">Revenue by store</h2>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d8" />
                <XAxis dataKey="name" tick={{ fill: '#556b2f' }} />
                <YAxis tick={{ fill: '#556b2f' }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6b7a47" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-charcoal">Recent activity</h2>
          <div className="mt-6 space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="rounded-3xl bg-sand/60 p-4">
                <p className="text-sm font-semibold text-charcoal">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-charcoal/70">Status: {order.status} • ₹{order.totalPrice ?? order.total ?? 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
