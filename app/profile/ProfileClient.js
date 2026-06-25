"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, ClipboardList, ShoppingBag, 
  Edit2, X, Save, CheckCircle, Package, Truck, Compass 
} from 'lucide-react';

export default function ProfileClient({ initialUser, initialOrders }) {
  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState(initialOrders);

  // Edit Profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editAddress, setEditAddress] = useState(
    user.address 
      ? [user.address.street, user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ')
      : ''
  );
  
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Active Order Details state for visual tracking timeline
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setSaving(true);

    const nameRegex = /^[a-zA-Z\s\-]+$/;
    if (!nameRegex.test(editName.trim())) {
      setEditError('Full Name can only contain letters, spaces, and hyphens.');
      setSaving(false);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(editPhone.trim())) {
      setEditError('Phone number must be exactly 10 numeric digits.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim()
        })
      });
      const data = await res.json();
      setSaving(false);

      if (res.ok && data.success) {
        setEditSuccess('Profile updated successfully!');
        setUser(data.user);
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess('');
        }, 1000);
      } else {
        setEditError(data.message || 'Failed to update profile details.');
      }
    } catch (err) {
      console.error(err);
      setEditError('Failed to connect to the server.');
      setSaving(false);
    }
  };

  // Format Address for display
  const addressDisplay = user.address 
    ? [user.address.street, user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ')
    : 'No address saved yet. Please edit your profile to add one.';

  // Extract uniquely purchased products from delivered orders
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.isDelivered);
  const purchasedProducts = [];
  const seenIds = new Set();
  
  deliveredOrders.forEach(order => {
    order.orderItems?.forEach(item => {
      const pId = item.product || item.id || item._id;
      if (pId && !seenIds.has(pId)) {
        seenIds.add(pId);
        purchasedProducts.push({
          id: pId,
          name: item.name,
          price: item.price,
          image: item.image || '/placeholder.png',
          unit: item.unit || 'piece'
        });
      }
    });
  });

  // Expected delivery date helper (placed date + 4 days)
  const getExpectedDeliveryDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 4);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Stepper timeline stages definition
  const trackingStages = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getStageIndex = (status) => {
    const s = status || 'Pending';
    return trackingStages.indexOf(s);
  };

  return (
    <div className="col-lg-10 mx-auto animate__animated animate__fadeIn">
      {/* Header Title with Edit Profile Button */}
      <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="text-center text-md-start">
          <span className="text-uppercase tracking-wider fw-bold text-cherry fs-7 mb-1 d-block" style={{ letterSpacing: '2px' }}>
            Dashboard
          </span>
          <h1 className="display-5 fw-bold text-dark m-0" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.95rem' }}>
            Manage your credentials and check your past regional harvest purchases.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditName(user.name || '');
            setEditPhone(user.phone || '');
            setEditAddress(user.address ? [user.address.street, user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ') : '');
            setEditError('');
            setEditSuccess('');
            setShowEditModal(true);
          }}
          className="btn btn-cherry rounded-pill px-4 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 align-self-center align-self-md-auto"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Account Details Block */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
              <User size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Full Name</span>
              <h6 className="fw-bold text-dark mb-0">{user.name}</h6>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
              <Mail size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-muted small d-block">Email Address</span>
              <h6 className="fw-bold text-dark mb-0 text-truncate">{user.email}</h6>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
              <Phone size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Phone Number</span>
              <h6 className="fw-bold text-dark mb-0">{user.phone || 'Not provided'}</h6>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="p-4 bg-white rounded-4 shadow-sm border border-light d-flex align-items-center gap-3 h-100">
            <div className="bg-cherry-light text-cherry p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
              <MapPin size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-muted small d-block">Shipping Address</span>
              <h6 className="fw-bold text-dark mb-0 text-truncate" title={addressDisplay}>{addressDisplay}</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Purchased Products Grid (Delivered Items Only) */}
      {purchasedProducts.length > 0 && (
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light mb-5">
          <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom border-light d-flex align-items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <ShoppingBag size={22} className="text-cherry" />
            <span>Purchased Products</span>
          </h4>
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {purchasedProducts.map((prod) => (
              <div key={prod.id} className="col">
                <div className="card h-100 border border-light rounded-4 overflow-hidden shadow-sm" style={{ transition: 'all 0.3s' }}>
                  <div className="position-relative bg-light" style={{ height: '140px' }}>
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div className="card-body p-3 text-center">
                    <h6 className="fw-bold text-dark text-truncate mb-1">{prod.name}</h6>
                    <span className="text-cherry font-semibold small">₹{prod.price} <span className="text-muted">/ {prod.unit}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History Section */}
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
        <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom border-light d-flex align-items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          <ClipboardList size={22} className="text-cherry" />
          <span>Order History</span>
        </h4>

        {orders.length === 0 ? (
          <div className="text-center py-5 bg-gold-light rounded-3 border border-dashed border-light">
            <div className="fs-2 mb-2">📦</div>
            <h6 className="fw-bold text-dark mb-1">No Orders Yet</h6>
            <p className="text-muted small px-3">You haven't placed any spice orders with us yet.</p>
            <Link href="/products" className="btn btn-sm btn-cherry rounded-pill mt-2 text-decoration-none">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => {
              const orderStatus = order.status || 'Pending';
              const isDelivered = orderStatus.toLowerCase() === 'delivered';
              const isCancelled = orderStatus.toLowerCase() === 'cancelled';
              const isTrackingOpen = activeTrackingOrderId === order._id;

              return (
                <div key={order._id.toString()} className="p-4 bg-light rounded-4 border border-light d-flex flex-column gap-3">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-bottom border-light/60 pb-3">
                    <div>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <p className="text-muted small mb-0">
                          Placed: <strong className="text-dark">{getFormattedDate(order.createdAt)}</strong>
                        </p>
                        <span className="text-muted small">|</span>
                        <p className="text-muted small mb-0">
                          Expected Delivery: <strong className="text-cherry">{getExpectedDeliveryDate(order.createdAt)}</strong>
                        </p>
                      </div>
                      <h6 className="fw-bold text-dark mb-0 mt-2">Total Paid: <span className="text-cherry">₹{(order.totalPrice ?? order.total ?? 0).toFixed(2)}</span></h6>
                      <small className="text-muted">{order.orderItems?.length || 0} items purchased</small>
                    </div>
                    <div className="d-flex flex-sm-column align-items-start align-items-sm-end gap-2">
                      <span className={`badge rounded-pill px-3 py-2 fw-semibold ${
                        isDelivered 
                          ? 'bg-success bg-opacity-10 text-success border border-success' 
                          : isCancelled 
                            ? 'bg-danger bg-opacity-10 text-danger border border-danger' 
                            : 'bg-warning bg-opacity-10 text-warning border border-warning'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {orderStatus}
                      </span>
                      {!isCancelled && !isDelivered && (
                        <button
                          onClick={() => setActiveTrackingOrderId(isTrackingOpen ? null : order._id)}
                          className="btn btn-link p-0 text-decoration-none text-cherry small fw-semibold mt-1"
                          style={{ fontSize: '0.8rem' }}
                        >
                          {isTrackingOpen ? 'Hide Tracking' : 'Track Order ➔'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render Visual Timeline Component for Active Order Tracking */}
                  {isTrackingOpen && !isCancelled && (
                    <div className="py-3 px-2 bg-white rounded-3 border border-light animate__animated animate__fadeIn">
                      <p className="text-xs text-cherry font-extrabold uppercase tracking-wider mb-3 px-2">📦 Live Shipment Tracking Status</p>
                      <div className="d-flex justify-content-between align-items-center position-relative px-3" style={{ minHeight: '60px' }}>
                        {/* Connecting Line */}
                        <div className="position-absolute bg-light-gray" style={{ height: '3px', top: '20px', left: '45px', right: '45px', backgroundColor: '#E5E7EB', zIndex: 0 }}></div>
                        <div className="position-absolute bg-cherry-gradient transition-all" style={{ 
                          height: '3px', 
                          top: '20px', 
                          left: '45px', 
                          width: `${(getStageIndex(orderStatus) / 3) * 100}%`,
                          maxWidth: 'calc(100% - 90px)',
                          zIndex: 1,
                          transition: 'width 0.5s ease-in-out'
                        }}></div>

                        {/* Steps */}
                        {trackingStages.map((stage, idx) => {
                          const isActive = idx <= getStageIndex(orderStatus);
                          const isCurrent = idx === getStageIndex(orderStatus);
                          return (
                            <div key={stage} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                              <div className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                                isActive 
                                  ? 'bg-cherry text-white shadow-sm border-2 border-cherry' 
                                  : 'bg-white text-muted border-2 border-light'
                              }`} style={{ 
                                width: '32px', 
                                height: '32px', 
                                backgroundColor: isActive ? 'var(--cherry)' : '#FFFFFF',
                                transform: isCurrent ? 'scale(1.2)' : 'none',
                                transition: 'all 0.3s'
                              }}>
                                {idx === 0 && <ClipboardList size={14} />}
                                {idx === 1 && <Package size={14} />}
                                {idx === 2 && <Truck size={14} />}
                                {idx === 3 && <CheckCircle size={14} />}
                              </div>
                              <span className={`small mt-2 fw-semibold ${isActive ? 'text-cherry' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>{stage}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Render Order Items list */}
                  <div className="row g-2">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 border border-light">
                          <img src={item.image || '/placeholder.png'} alt={item.name} className="rounded" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                          <div className="min-w-0 flex-grow-1">
                            <p className="small text-dark font-bold text-truncate mb-0">{item.name}</p>
                            <small className="text-muted">{item.quantity} x ₹{item.price}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="bg-white rounded-4 p-4 p-md-5 max-w-md w-full shadow-2xl border border-neutral-100 relative animate__animated animate__fadeInUp animate__faster">
            <button 
              type="button" 
              onClick={() => setShowEditModal(false)}
              className="btn-close position-absolute top-0 end-0 m-3 border-0 bg-transparent"
              style={{ fontSize: '1.25rem' }}
            >
              <X size={18} className="text-muted" />
            </button>

            <h3 className="text-2xl font-extrabold text-neutral-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Edit Profile Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="mb-3">
                <label className="form-label text-dark small fw-semibold">Full Name *</label>
                <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                  <User size={16} className="text-muted me-2" />
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-Z\s\-]/g, ''))} 
                    required
                    placeholder="Enter full name"
                    className="w-100 border-0 bg-transparent text-sm"
                    style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-dark small fw-semibold">Phone Number *</label>
                <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                  <Phone size={16} className="text-muted me-2" />
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                    required
                    placeholder="Enter phone number"
                    className="w-100 border-0 bg-transparent text-sm"
                    style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-dark small fw-semibold">Shipping Address</label>
                <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                  <MapPin size={16} className="text-muted me-2" />
                  <input 
                    type="text" 
                    value={editAddress} 
                    onChange={(e) => setEditAddress(e.target.value)} 
                    placeholder="e.g. Street, City, State, Pincode"
                    className="w-100 border-0 bg-transparent text-sm"
                    style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {editError && (
                <div className="alert alert-danger py-2 px-3 rounded-3 small border-0 mb-3" style={{ backgroundColor: '#FFF2F4', color: '#D2143A' }}>
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="alert alert-success py-2 px-3 rounded-3 small border-0 mb-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                  <CheckCircle size={16} /> <span>{editSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-100 py-3 bg-cherry hover:bg-cherry-dark text-white font-bold rounded-pill transition-all shadow-lg border-0 cursor-pointer text-sm d-flex align-items-center justify-content-center gap-2"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
