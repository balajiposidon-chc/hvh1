"use client";

import { useEffect, useState, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Eye, Calendar, User, RefreshCw, X, Download, Printer, Search, Filter } from 'lucide-react';

function StoreOrdersManagementContent() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdParam = searchParams.get('storeId');
  const openIdParam = searchParams.get('openId');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (openIdParam && orders.length > 0) {
      const match = orders.find(o => o._id === openIdParam);
      if (match) {
        setSelectedOrder(match);
      }
    }
  }, [openIdParam, orders]);

  useEffect(() => {
    if (user) {
      const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
      if (!isSuperAdmin && !permissions.includes('store-panel')) {
        router.push('/unauthorized');
      } else {
        fetchOrders();
      }
    }
  }, [user, permissions, router, storeIdParam]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = storeIdParam ? `/api/store-panel/orders?storeId=${storeIdParam}` : '/api/store-panel/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Delivered') {
        payload.isDelivered = true;
        payload.isPaid = true; // COD cash collected
      }
      
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, isDelivered: newStatus === 'Delivered' } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus, isDelivered: newStatus === 'Delivered' }));
        }
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    } finally {
      setUpdatingId(null);
    }
  };

  const isSuperAdmin = user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'superadmin';
  if (!user || (!permissions.includes('store-panel') && !isSuperAdmin)) return null;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All Status') {
      matchesStatus = (order.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Order Fulfillment</h2>
        <p className="text-neutral-500 font-medium">Track shipping requests, update dispatch statuses, and process deliveries</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-neutral-900"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-medium text-neutral-700 text-sm"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
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
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                      #ORD-{order._id.slice(-6).toUpperCase()}
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">
                      ₹{(order.totalPrice || order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={order.status} 
                        disabled={updatingId === order._id}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none bg-white cursor-pointer transition-all ${
                          order.status === 'Delivered' 
                            ? 'text-green-600 border-green-200 bg-green-50/50' 
                            : order.status === 'Cancelled'
                              ? 'text-red-600 border-red-200 bg-red-50/50'
                              : order.status === 'Pending'
                                ? 'text-yellow-600 border-yellow-200 bg-yellow-50/50'
                                : 'text-blue-600 border-blue-200 bg-blue-50/50'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 cursor-pointer border-0 bg-transparent"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-extrabold text-neutral-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" /> Order #{selectedOrder._id.slice(-6).toUpperCase()}
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase mb-1">Status</p>
                  <p className="text-sm font-bold text-neutral-700">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase mb-1">Placed On</p>
                  <p className="text-sm font-bold text-neutral-700">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-3 flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> Shipping & Customer</h5>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p><span className="font-semibold">Name:</span> {selectedOrder.user?.name || 'Guest'}</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedOrder.phone || 'N/A'}</p>
                  <p><span className="font-semibold">Address:</span> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-3">Order Items</h5>
                <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <li key={idx} className="p-3 flex justify-between items-center bg-white hover:bg-neutral-50/30 transition-colors">
                      <div>
                        <p className="font-bold text-neutral-900 text-sm">{item.name}</p>
                        <p className="text-xs text-neutral-400">Qty: {item.quantity} {item.unit || 'piece'} • ₹{item.price} each</p>
                      </div>
                      <span className="font-bold text-neutral-800 text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-extrabold text-neutral-900">Total Price</span>
                  <span className="font-extrabold text-xl text-primary">₹{(selectedOrder.totalPrice || selectedOrder.total || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const { downloadInvoicePDF } = await import('@/utils/invoice');
                      await downloadInvoicePDF(selectedOrder);
                    }}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <Download className="w-4 h-4" /> PDF Invoice
                  </button>
                  <button
                    onClick={async () => {
                      const { printInvoiceHTML } = await import('@/utils/invoice');
                      await printInvoiceHTML(selectedOrder);
                    }}
                    className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-neutral-200"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function StoreOrdersManagement() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Scoped Orders...</p>
      </div>
    }>
      <StoreOrdersManagementContent />
    </Suspense>
  );
}
