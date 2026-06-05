"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, CreditCard, ShoppingBag } from 'lucide-react';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
    const { data: session } = useSession();
    const { cart, clearCart } = useCart();
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const subtotal = cart.reduce((sum, item) => {
        const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = subtotal + shippingFee + tax;

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        
        if (!session) {
            setError('Please log in before checking out.');
            return;
        }
        if (!address || !phone) {
            setError('Shipping address and phone are required.');
            return;
        }
        if (cart.length === 0) {
            setError('Your bag is empty.');
            return;
        }

        setLoading(true);
        try {
            // Map cart items format to match order requirements
            const mappedItems = cart.map(item => ({
                id: item.id || item._id,
                name: item.name,
                price: item.discountPrice > 0 ? item.discountPrice : item.price,
                quantity: item.quantity,
                image: item.images?.[0] || '/placeholder.png'
            }));

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address, 
                    phone, 
                    items: mappedItems, 
                    subtotal, 
                    tax, 
                    shippingFee, 
                    total 
                }),
            });
            const data = await response.json();
            setLoading(false);
            if (!response.ok) {
                setError(data.message || 'Unable to place order');
                return;
            }
            setMessage('Order placed successfully.');
            clearCart();
        } catch (err) {
            console.error("Checkout order error", err);
            setError('Unable to process the order request. Please try again.');
            setLoading(false);
        }
    };

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 px-lg-5 py-5 flex-grow-1">
          {/* Back Link */}
          <Link href="/cart" className="text-decoration-none text-cherry fw-semibold mb-4 d-inline-flex align-items-center gap-2 small">
            <ArrowLeft size={16} /> Back to Bag
          </Link>

          <h1 className="display-6 fw-bold text-dark mb-4 animate__animated animate__fadeIn" style={{ fontFamily: "'Playfair Display', serif" }}>
            Secure Checkout
          </h1>

          {!session ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
              <span className="fs-1 d-block mb-3">🔒</span>
              <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Authentication Required</h3>
              <p className="text-muted small">You need to log in to complete your checkout process.</p>
              <Link href="/login" className="btn btn-cherry mt-3 rounded-pill px-4 text-decoration-none">
                Login Now
              </Link>
            </div>
          ) : cart.length === 0 && !message ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
              <span className="fs-1 d-block mb-3">🛍️</span>
              <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your Bag is Empty</h3>
              <p className="text-muted small">Add premium spices to your bag before proceeding to checkout.</p>
              <Link href="/products" className="btn btn-cherry mt-3 rounded-pill px-4 text-decoration-none">
                Shop Products
              </Link>
            </div>
          ) : message ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__zoomIn">
              <span className="fs-1 d-block mb-3 text-success">🎉</span>
              <h3 className="fw-bold text-success mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Order Placed!</h3>
              <p className="text-muted small">Your order has been created successfully. We'll dispatch your fresh spices shortly.</p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Link href="/orders" className="btn btn-cherry rounded-pill px-4 text-decoration-none">
                  View My Orders
                </Link>
                <Link href="/" className="btn btn-outline-cherry rounded-pill px-4 text-decoration-none">
                  Back to Store
                </Link>
              </div>
            </div>
          ) : (
            <div className="row g-4 mt-1 animate__animated animate__fadeInUp">
              {/* Left Column: Form */}
              <div className="col-lg-7">
                <form onSubmit={handlePlaceOrder} className="d-flex flex-column gap-3">
                  <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
                    <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom border-light d-flex align-items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <MapPin size={18} className="text-cherry" />
                      <span>Shipping Address</span>
                    </h5>

                    {/* Address Input */}
                    <div className="mb-4">
                      <label className="form-label text-dark small fw-semibold">Delivery Address</label>
                      <input 
                        type="text"
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required
                        placeholder="Street address, apartment, city, state, pincode"
                        className="form-control rounded-pill px-4 py-3 bg-light border border-light text-sm"
                        style={{ outline: 'none' }}
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="form-label text-dark small fw-semibold">Contact Phone Number</label>
                      <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                        <Phone size={16} className="text-muted me-2" />
                        <input 
                          type="text"
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          required
                          placeholder="Phone number"
                          className="w-100 border-0 bg-transparent text-sm"
                          style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger py-2 px-3 rounded-3 small border-0" style={{ backgroundColor: '#FFF2F4', color: '#D2143A' }}>
                      Error: {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-cherry py-3.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    <CreditCard size={18} />
                    <span>{loading ? 'Processing Transaction...' : 'Place Secure Order'}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Order Summary Info */}
              <div className="col-lg-5">
                <div className="glass-card p-4 bg-white mb-3">
                  <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom border-light d-flex align-items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <ShoppingBag size={18} className="text-cherry" />
                    <span>Order Bag Items</span>
                  </h5>

                  {/* Tiny Item List */}
                  <div className="d-flex flex-column gap-3 mb-4 overflow-auto" style={{ maxHeight: '220px' }}>
                    {cart.map((item) => {
                      const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                      return (
                        <div key={item.id} className="d-flex align-items-center gap-3">
                          <img src={item.images?.[0] || '/placeholder.png'} alt={item.name} className="rounded" style={{ height: '40px', width: '40px', objectFit: 'cover' }} />
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="fw-bold text-dark small mb-0 text-truncate">{item.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                          <span className="fw-semibold small text-dark">₹{itemPrice * item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex flex-column gap-2 text-sm border-top border-light pt-3">
                    <div className="d-flex justify-content-between text-muted">
                      <span>Subtotal:</span>
                      <span className="text-dark fw-semibold">₹{subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>GST (5%):</span>
                      <span className="text-dark fw-semibold">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Shipping:</span>
                      <span className="text-dark fw-semibold">
                        {shippingFee === 0 ? <span className="text-success fw-bold">FREE</span> : `₹${shippingFee}`}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top border-light mt-3 pt-3">
                    <span className="fw-bold text-dark">Total:</span>
                    <span className="fs-4 fw-bold text-cherry">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
}
