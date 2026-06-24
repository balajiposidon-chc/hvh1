"use client";

import { useEffect, useState, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, AlertTriangle, ArrowUp, Eye, Package, Shield, Store, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

function StoreManagerDashboardContent() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdParam = searchParams.get('storeId');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
      if (!isSuperAdmin && !permissions.includes('store-panel')) {
        router.push('/unauthorized');
      } else {
        fetchDashboardStats();
      }
    }
  }, [user, permissions, router, storeIdParam]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const url = storeIdParam ? `/api/store-panel/stats?storeId=${storeIdParam}` : '/api/store-panel/stats';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStats(data);
      } else {
        setError(data.message || 'Failed to load store statistics.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            recentOrders: prev.recentOrders.filter(o => o._id !== id)
          };
        });
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  const isSuperAdmin = user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'superadmin';
  if (!user || (!permissions.includes('store-panel') && !isSuperAdmin)) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Store Dashboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 max-w-lg mx-auto mt-12 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h4 className="font-extrabold text-xl mb-2">Access Restrained</h4>
          <p className="font-medium text-sm text-red-600 mb-4">{error}</p>
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold inline-block text-decoration-none">Back to Storefront</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-extrabold text-neutral-900 m-0">{stats.store?.name}</h2>
              </div>
              <p className="text-neutral-500 font-medium">Scoping dashboard for manager {user.name} ({stats.store?.location})</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" /> Store Active
              </span>
            </div>
          </div>

          {/* KPI Cards */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Revenue', value: `₹${stats.summary.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
              { title: 'Active Orders', value: stats.summary.activeOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Store Catalog Items', value: stats.summary.totalProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Low Stock Items', value: stats.summary.lowStockItems, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
            ].map((kpi, idx) => (
              <motion.div variants={fadeIn} key={idx}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-neutral-500 font-medium mb-1">{kpi.title}</p>
                      <h3 className="text-2xl font-bold text-neutral-900">{kpi.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.bg}`}>
                      <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-bold uppercase tracking-wide">Scoped metrics</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 h-full">
                <div className="mb-6">
                  <h5 className="text-xl font-bold text-neutral-900">Cash Flow (Monthly)</h5>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#2d4a22" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Revenue" />
                      <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 h-full">
                <div className="mb-6">
                  <h5 className="text-xl font-bold text-neutral-900">Sales Volume (Orders)</h5>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                      <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="sales" fill="#cb997e" radius={[6, 6, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Orders Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mb-12">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
                <h5 className="text-xl font-bold text-neutral-900 mb-0">Recent Scoped Orders</h5>
                <Link href="/store-panel/orders" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors text-decoration-none">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {stats.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">No orders found for this store yet.</td>
                      </tr>
                    ) : (
                      stats.recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">#ORD-{order._id.slice(-6).toUpperCase()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-bold text-neutral-900 mb-0 leading-tight">{order.user?.name || 'Guest'}</p>
                              <p className="text-xs text-neutral-500">{order.user?.email || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">
                            {(() => {
                              const d = new Date(order.createdAt);
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Delivered' 
                                ? 'bg-green-50 text-green-600 border border-green-200' 
                                : order.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">
                            ₹{(order.totalPrice || order.total || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link href={`/store-panel/orders?openId=${order._id}`} className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1 inline-block" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={`/store-panel/orders?openId=${order._id}`} className="p-2 text-neutral-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 mr-1 inline-block" title="Edit Order">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 inline-block cursor-pointer border-0 bg-transparent"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AdminLayout>
  );
}

export default function StoreManagerDashboard() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Store Dashboard...</p>
      </div>
    }>
      <StoreManagerDashboardContent />
    </Suspense>
  );
}
