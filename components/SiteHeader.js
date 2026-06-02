"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, LogIn, User, LogOut, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky-top w-100 transition-all ${isScrolled ? 'glass-nav shadow-sm py-2' : 'bg-white py-3'}`} style={{ zIndex: 1020, transition: 'all 0.3s ease' }}>
      <div className="container px-4 px-lg-5">
        <div className="d-flex align-items-center justify-content-between">
          {/* Brand Logo */}
          <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <div className="position-relative">
              <img 
                src="/logo.jpg" 
                alt="Hill & Valley Logo" 
                className="rounded-circle object-cover border border-2" 
                style={{ height: '56px', width: '56px', borderColor: 'var(--gold-accent)' }} 
              />
            </div>
            <span className="text-cherry fw-bold fs-3 tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              Hill & Valley
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="d-none d-md-flex align-items-center gap-4">
            <Link href="/products" className="text-dark fw-semibold text-decoration-none px-2 py-1" style={{ transition: 'color 0.2s', fontSize: '0.95rem' }}>
              Shop Products
            </Link>
            <Link href="/cart" className="position-relative text-dark fw-semibold text-decoration-none px-2 py-1 d-flex align-items-center gap-2" style={{ transition: 'color 0.2s', fontSize: '0.95rem' }}>
              <ShoppingCart size={18} className="text-muted" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate__animated animate__pulse animate__infinite" style={{ fontSize: '0.65rem', padding: '0.35em 0.5em' }}>
                  {cartCount}
                </span>
              )}
              Cart
            </Link>

            {user ? (
              <div className="position-relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn btn-outline-cherry py-1.5 px-3 rounded-pill d-flex align-items-center gap-2 fw-semibold"
                  style={{ fontSize: '0.9rem', borderWidth: '1.5px' }}
                >
                  <User size={15} />
                  <span>{user.name}</span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border border-light py-2 animate__animated animate__fadeIn" style={{ width: '200px', zIndex: 1030 }}>
                    <Link href="/profile" className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-muted" onClick={() => setDropdownOpen(false)}>
                      <User size={14} /> My Profile
                    </Link>
                    {user.role !== 'Customer' && (
                      <Link 
                        href={user.role === 'Super Admin' ? '/superadmin-dashboard' : '/admin'} 
                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-muted"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                    )}
                    <hr className="dropdown-divider my-1" />
                    <button 
                      onClick={() => { logout(); setDropdownOpen(false); }} 
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger text-start w-100 bg-transparent border-0"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn btn-cherry text-decoration-none d-flex align-items-center gap-2">
                <LogIn size={15} /> <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="btn d-md-none border-0 text-dark p-1" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="d-md-none bg-white border-top border-light animate__animated animate__fadeInDown py-3 px-4 shadow-sm">
          <div className="d-flex flex-column gap-3">
            <Link href="/products" className="text-dark text-decoration-none py-2 fw-medium border-bottom border-light" onClick={() => setMobileMenuOpen(false)}>
              Shop Products
            </Link>
            <Link href="/cart" className="text-dark text-decoration-none py-2 fw-medium border-bottom border-light d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingCart size={18} /> Cart ({cartCount})
            </Link>
            {user ? (
              <>
                <Link href="/profile" className="text-dark text-decoration-none py-2 fw-medium border-bottom border-light d-flex align-items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <User size={16} /> My Profile
                </Link>
                {user.role !== 'Customer' && (
                  <Link 
                    href={user.role === 'Super Admin' ? '/superadmin-dashboard' : '/admin'} 
                    className="text-dark text-decoration-none py-2 fw-medium border-bottom border-light d-flex align-items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="btn btn-sm btn-outline-danger w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-cherry w-100 mt-2 text-decoration-none" onClick={() => setMobileMenuOpen(false)}>
                <LogIn size={16} className="me-2" /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
