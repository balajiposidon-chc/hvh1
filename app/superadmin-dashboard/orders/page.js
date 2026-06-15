"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, Filter, Eye, Download, FileText, Edit, Trash2, Printer } from 'lucide-react';

export default function OrdersManagement() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const isAuthorized = user.role === 'Super Admin' || permissions.includes('orders');
      if (!isAuthorized) {
        router.push('/');
      } else {
        fetchOrders();
      }
    }
  }, [user, permissions, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    const { downloadInvoicePDF } = await import('@/utils/invoice');
    await downloadInvoicePDF(order);
  };

  const handlePrintInvoice = async (order) => {
    const { printInvoiceHTML } = await import('@/utils/invoice');
    printInvoiceHTML(order);
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Orders Management</h2>
          <p className="text-neutral-500 font-medium">Track, process, and manage customer orders</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors w-full md:w-auto">
          <Download className="w-4 h-4" /> Export Orders
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer name..." 
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-medium text-neutral-700">
                <option>All Status</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                      #{order._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{order.user?.name || 'Guest'}</span>
                        <span className="text-xs text-neutral-500">{order.shippingAddress?.city || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {order.status || 'Processing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">
                      ₹{order.totalPrice || order.total || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => router.push(`/superadmin-dashboard/orders/${order._id}/edit`)}
                        className="p-2 text-neutral-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 mr-1" 
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1" 
                        title="Download PDF Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-neutral-100 mr-1" 
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" 
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
        <div className="p-4 border-t border-neutral-100 flex justify-between items-center text-sm text-neutral-500 bg-neutral-50/30">
          <span>Showing {orders.length} orders</span>
        </div>
      </div>
    </AdminLayout>
  );
}
