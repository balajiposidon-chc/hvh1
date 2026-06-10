"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Bell, IndianRupee, ShoppingCart, Users, AlertTriangle, ArrowUp, Eye, Trash2 } from 'lucide-react';

const dummyData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
];

export default function SuperAdminDashboard() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();

  // Basic client-side protection fallback (Middleware handles true protection)
  useEffect(() => {
    if (user) {
      const isSuper = user.role === 'Super Admin' || permissions.includes('rbac');
      if (!isSuper) {
        router.push('/');
      }
    }
  }, [user, permissions, router]);

  if (!user) return null;

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Low Stock Warning', message: 'Saffron Spice (SKU: HV-SPICE) is below 5 units in central stock.', type: 'warning', time: '10 mins ago', read: false },
    { id: 2, title: 'Database Check Passed', message: 'Orphaned reference check passed with 0 conflicts.', type: 'success', time: '1 hour ago', read: false },
    { id: 3, title: 'New Store Active', message: 'Bangalore franchise panel has been initialized.', type: 'info', time: '3 hours ago', read: false },
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleExport = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Amount"];
    const rows = [
      ["#ORD-2026-104", "Customer 1", "customer1@email.com", "May 1, 2026", "Processing", "₹1999"],
      ["#ORD-2026-204", "Customer 2", "customer2@email.com", "May 1, 2026", "Delivered", "₹3499"],
      ["#ORD-2026-304", "Customer 3", "customer3@email.com", "May 1, 2026", "Processing", "₹4999"],
      ["#ORD-2026-404", "Customer 4", "customer4@email.com", "May 1, 2026", "Delivered", "₹6499"],
      ["#ORD-2026-504", "Customer 5", "customer5@email.com", "May 1, 2026", "Processing", "₹7999"],
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dashboard_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

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

      {/* KPI Cards */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: '₹4,52,310', icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Active Orders', value: '142', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Customers', value: '1,240', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Low Stock Items', value: '12', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
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
                <span className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUp className="w-3 h-3 mr-1" /> 4.5%
                </span>
                <span className="text-sm text-neutral-500 font-medium">vs last month</span>
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
                <LineChart data={dummyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
              <h5 className="text-xl font-bold text-neutral-900">Sales by Category</h5>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
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
            <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">View All</button>
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
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">#ORD-2026-{item}04</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold">
                          {String.fromCharCode(64 + item)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 mb-0 leading-tight">Customer {item}</p>
                          <p className="text-xs text-neutral-500">customer{item}@email.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">May 1, 2026</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        item % 2 === 0 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {item % 2 === 0 ? 'Delivered' : 'Processing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">₹{item * 1500 + 499}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
