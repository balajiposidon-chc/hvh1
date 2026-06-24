"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Bell, IndianRupee, ShoppingCart, Users, AlertTriangle, ArrowUp, Eye, Trash2, Package } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Basic client-side protection fallback (Middleware handles true protection)
  useEffect(() => {
    if (user) {
      const isSuper = user.role === 'Super Admin' || permissions.includes('rbac');
      if (!isSuper) {
        router.push('/');
      } else {
        fetchDashboardStats();
      }
    }
  }, [user, permissions, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard-stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } else {
        setError(data.message || 'Failed to load dashboard data.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure loading stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!data.success) {
        alert('Failed to fetch orders for export');
        return;
      }
      const allOrders = data.orders || [];
      const headers = ["Order ID", "Customer Name", "Customer Email", "Date", "Status", "Amount"];
      const rows = allOrders.map(order => [
        `#ORD-${order._id.toString().toUpperCase()}`,
        order.user?.name || "Guest",
        order.user?.email || "N/A",
        new Date(order.createdAt).toLocaleDateString(),
        order.status,
        `₹${order.totalPrice || order.total || 0}`
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `dashboard_orders_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export orders.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh statistics
        fetchDashboardStats();
      } else {
        alert(data.message || 'Failed to delete order.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error deleting order.');
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Overview Dashboard</h2>
          <p className="text-neutral-500 font-medium">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all cursor-pointer border-0"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-white text-primary text-xs font-black rounded-full px-1.5 py-0.5 ml-1">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 py-3 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-neutral-100 flex justify-between items-center bg-white">
                    <span className="font-bold text-neutral-800 text-sm">System Notifications</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  
                  <div className="divide-y divide-neutral-50 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-neutral-400">No notifications found.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 hover:bg-neutral-50/50 transition-colors flex gap-2.5 items-start ${!n.read ? 'bg-neutral-50/20' : ''}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className={`text-xs font-bold text-neutral-800 leading-tight m-0 ${!n.read ? 'font-extrabold' : ''}`}>{n.title}</p>
                              <span className="text-[10px] text-neutral-400 font-medium">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1 mb-0 leading-normal">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm">
          Loading dashboard statistics...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 rounded-3xl p-6 border border-red-100 shadow-sm text-center">
          {error}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Revenue', value: `₹${(stats?.summary?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, bg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md text-white border-0' },
              { title: 'Total Orders', value: stats?.summary?.totalOrders || 0, icon: ShoppingCart, bg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md text-white border-0' },
              { title: 'Total Products', value: stats?.summary?.totalProducts || 0, icon: Package, bg: 'bg-gradient-to-br from-purple-500 to-indigo-700 shadow-md text-white border-0' },
              { title: 'Total Users', value: stats?.summary?.totalCustomers || 0, icon: Users, bg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md text-white border-0' }
            ].map((kpi, idx) => (
              <motion.div variants={fadeIn} key={idx}>
                <div className={`rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${kpi.bg}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="opacity-90 font-bold mb-1 text-sm uppercase tracking-wider">{kpi.title}</p>
                      <h3 className="text-3xl font-extrabold text-white">{kpi.value}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm">
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs font-extrabold bg-white bg-opacity-35 text-white px-2 py-0.5 rounded-md">
                      <ArrowUp className="w-3 h-3 mr-1" /> 100%
                    </span>
                    <span className="text-xs text-white opacity-85 font-medium">Real-time Data</span>
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
                  <h5 className="text-xl font-bold text-neutral-900">Revenue Overview</h5>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.monthlyData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#2d4a22" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 h-full">
                <div className="mb-6">
                  <h5 className="text-xl font-bold text-neutral-900">Sales count by Month</h5>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.monthlyData || []} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                      <Tooltip 
                        cursor={{ fill: '#f8f9fa' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="sales" fill="#cb997e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Orders Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
                <h5 className="text-xl font-bold text-neutral-900 mb-0">Recent Orders</h5>
                <button 
                  onClick={() => router.push('/superadmin-dashboard/orders')} 
                  className="text-sm font-bold text-primary hover:text-primary-dark transition-colors border-0 bg-transparent cursor-pointer"
                >
                  View All
                </button>
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
                    {(stats?.recentOrders || []).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-neutral-400 font-medium">
                          No orders registered in system yet.
                        </td>
                      </tr>
                    ) : (
                      (stats?.recentOrders || []).map((order) => {
                        const statusColor = order.status?.toLowerCase() === 'delivered' 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : order.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-200';

                        return (
                          <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                              #ORD-{order._id.toString().toUpperCase().slice(-6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold uppercase">
                                  {(order.user?.name || 'G')[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-neutral-900 mb-0 leading-tight">
                                    {order.user?.name || 'Guest Customer'}
                                  </p>
                                  <p className="text-xs text-neutral-500 mb-0">
                                    {order.user?.email || 'N/A'}
                                  </p>
                                </div>
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
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">
                              ₹{(order.totalPrice || order.total || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button 
                                onClick={() => router.push(`/superadmin-dashboard/orders/${order._id}/edit`)}
                                className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1 border-0 bg-transparent cursor-pointer"
                                title="View/Edit Order"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order._id)}
                                className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 border-0 bg-transparent cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
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
