"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Save } from 'lucide-react';

export default function SuperAdminOrderEditPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  
  const [status, setStatus] = useState('Pending');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Store Manager') {
      router.push('/');
    } else if (user) {
      fetchOrder();
    }
  }, [user, router]);

  const fetchOrder = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        const found = data.orders.find(o => o._id === params.id);
        if (found) {
          setOrder(found);
          setStatus(found.status || 'Pending');
          setStreet(found.shippingAddress?.street || '');
          setCity(found.shippingAddress?.city || '');
          setState(found.shippingAddress?.state || '');
          setZipCode(found.shippingAddress?.zipCode || '');
          setPhone(found.phone || '');
          setIsPaid(found.isPaid || false);
          setIsDelivered(found.isDelivered || false);
        } else {
          setError('Order not found in records.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          isPaid,
          isDelivered,
          street,
          city,
          state,
          zipCode,
          phone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Order updated successfully.');
        router.push('/superadmin-dashboard/orders');
      } else {
        setError(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="mb-6">
        <button 
          onClick={() => router.push('/superadmin-dashboard/orders')}
          className="text-decoration-none text-neutral-500 hover:text-primary mb-4 d-inline-flex align-items-center gap-2 small border-0 bg-transparent"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Edit Order #{params.id.substring(0, 8).toUpperCase()}</h2>
        <p className="text-neutral-500 font-medium">Update status, shipping address, and payment information</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm">Loading order details...</div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-12 text-center text-rose-500 border border-neutral-100 shadow-sm">Error: {error}</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">Shipping Details</h5>
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Street Address</label>
                <input 
                  type="text" 
                  value={street} 
                  onChange={(e) => setStreet(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">State</label>
                  <input 
                    type="text" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Zip Code</label>
                  <input 
                    type="text" 
                    value={zipCode} 
                    onChange={(e) => setZipCode(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Contact Phone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">Order Items</h5>
              <div className="divide-y divide-neutral-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} alt="" className="rounded border border-neutral-200" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      <div>
                        <p className="font-bold text-neutral-950 mb-0">{item.name}</p>
                        <small className="text-neutral-500">Price: ₹{item.price}</small>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 mb-0">Qty: {item.quantity}</p>
                      <small className="text-primary font-semibold">Subtotal: ₹{item.price * item.quantity}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">Status & Control</h5>
              
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Order Fulfillment Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="form-select rounded-xl p-3 bg-neutral-50 border-0 text-sm outline-none w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 mt-4 border border-neutral-100">
                <input 
                  type="checkbox" 
                  checked={isPaid} 
                  onChange={(e) => setIsPaid(e.target.checked)} 
                  className="h-4 w-4"
                  id="chkPaid"
                />
                <label htmlFor="chkPaid" className="text-sm font-semibold text-neutral-700 select-none">Order is Paid</label>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 mt-2 border border-neutral-100">
                <input 
                  type="checkbox" 
                  checked={isDelivered} 
                  onChange={(e) => setIsDelivered(e.target.checked)} 
                  className="h-4 w-4"
                  id="chkDelivered"
                />
                <label htmlFor="chkDelivered" className="text-sm font-semibold text-neutral-700 select-none">Order is Delivered</label>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-3">Order Financials</h5>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-900">₹{order.itemsPrice || order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST):</span>
                  <span className="font-semibold text-neutral-900">₹{order.taxPrice || order.tax || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-neutral-900">₹{order.shippingPrice || order.shippingFee || 0}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold text-neutral-900 text-base">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{order.totalPrice || order.total || 0}</span>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger p-3 rounded-2xl text-xs">{error}</div>}
            {message && <div className="alert alert-success p-3 rounded-2xl text-xs">{message}</div>}

            <button 
              type="submit"
              disabled={saving}
              className="btn btn-cherry w-full py-3.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <Save size={18} />
              <span>{saving ? 'Saving changes...' : 'Save Order Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
