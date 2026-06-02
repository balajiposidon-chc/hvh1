"use client";

import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const subtotal = cart.reduce((sum, item) => {
        const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);
    
    const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
    const gstRate = 0.05; // 5% GST
    const tax = subtotal * gstRate;
    const total = subtotal + shippingFee + tax;

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 px-lg-5 py-5 flex-grow-1">
          <h1 className="display-6 fw-bold text-dark mb-4 animate__animated animate__fadeIn" style={{ fontFamily: "'Playfair Display', serif" }}>
            Shopping Bag
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
              <div className="fs-1 d-block mb-3">🛍️</div>
              <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your Bag is Empty</h3>
              <p className="text-muted small">You haven't added any spices or culinary essentials to your bag yet.</p>
              <Link href="/products" className="btn btn-cherry mt-3 rounded-pill px-4">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="row g-4 mt-1 animate__animated animate__fadeInUp">
              {/* Left Side: Cart Items */}
              <div className="col-lg-8">
                <div className="d-flex flex-column gap-3">
                  {cart.map((item) => {
                    const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                    const itemImage = item.images?.[0] || '/placeholder.png';
                    return (
                      <div key={item.id} className="d-flex flex-column flex-sm-row align-items-center gap-4 bg-white p-4 rounded-4 shadow-sm border border-light" style={{ transition: 'all 0.3s' }}>
                        {/* Image */}
                        <div className="rounded-3 overflow-hidden bg-light" style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                          <img src={itemImage} alt={item.name} className="w-100 h-100 object-cover" />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-grow-1 text-center text-sm-start">
                          <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                            {item.categoryName || 'Organic'}
                          </span>
                          <h5 className="fw-bold text-dark mb-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>
                            {item.name}
                          </h5>
                          <p className="text-cherry fw-semibold small mb-2">₹{itemPrice} each</p>
                          
                          {/* Quantity selector */}
                          <div className="d-inline-flex align-items-center border border-light rounded-pill p-1 bg-light">
                            <button 
                              className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center" 
                              style={{ width: '26px', height: '26px', padding: 0 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 fw-bold text-dark small">{item.quantity}</span>
                            <button 
                              className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center" 
                              style={{ width: '26px', height: '26px', padding: 0 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="text-center text-sm-end d-flex flex-column justify-content-between h-100">
                          <span className="fs-5 fw-bold text-dark mb-2 d-block">₹{itemPrice * item.quantity}</span>
                          <button 
                            className="btn btn-link text-decoration-none text-danger p-0 d-flex align-items-center gap-1 small justify-content-center justify-content-sm-end"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <Link href="/products" className="text-decoration-none text-cherry fw-semibold d-inline-flex align-items-center gap-2 small">
                    <ArrowLeft size={16} /> Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Right Side: Summary Card */}
              <div className="col-lg-4">
                <div className="glass-card p-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h4>
                  
                  <div className="d-flex flex-column gap-3 text-sm border-bottom border-light pb-4">
                    <div className="d-flex justify-content-between text-muted">
                      <span>Items:</span>
                      <span className="text-dark fw-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Subtotal:</span>
                      <span className="text-dark fw-semibold">₹{subtotal}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>GST (5%):</span>
                      <span className="text-dark fw-semibold">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Shipping Fee:</span>
                      <span className="text-dark fw-semibold">
                        {shippingFee === 0 ? <span className="text-success fw-bold">FREE</span> : `₹${shippingFee}`}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
                        *Add ₹{1000 - subtotal} more to get FREE shipping!
                      </p>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center my-4">
                    <span className="fw-bold text-dark">Estimated Total:</span>
                    <span className="fs-4 fw-bold text-cherry">₹{total.toFixed(2)}</span>
                  </div>

                  <Link href="/checkout" className="btn btn-cherry w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 text-white text-decoration-none">
                    <CreditCard size={18} />
                    <span>Proceed to Checkout</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
}
