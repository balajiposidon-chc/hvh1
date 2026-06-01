"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cherry flex items-center gap-2 text-decoration-none">
            <img src="/logo.jpg" alt="Hill & Valley" className="rounded-full object-cover" style={{ height: '40px', width: '40px' }} />
            <span className="text-3xl text-cherry" style={{ fontFamily: "'Playfair Display', serif" }}>Hill & Valley</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-neutral-800 hover:text-primary font-medium transition-colors">Home</Link>
            <Link href="/products" className="text-neutral-800 hover:text-primary font-medium transition-colors">Shop</Link>
            <Link href="/about" className="text-neutral-800 hover:text-primary font-medium transition-colors">About Us</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/cart" className="relative text-neutral-800 hover:text-primary transition-colors flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate__animated animate__zoomIn">
                  {cartCount}
                </span>
              )}
              <span className="font-medium">Cart</span>
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors focus:outline-none"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 overflow-hidden"
                    >
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-neutral-700 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      {user.role !== 'Customer' && (
                        <Link href={`/${user.role.toLowerCase().replace(' ', '')}-dashboard`} className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 text-neutral-700 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      <div className="border-t border-neutral-100 my-1"></div>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-neutral-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-neutral-800 font-medium py-2 border-b border-neutral-50">Home</Link>
              <Link href="/products" className="text-neutral-800 font-medium py-2 border-b border-neutral-50">Shop</Link>
              <Link href="/about" className="text-neutral-800 font-medium py-2 border-b border-neutral-50">About Us</Link>
              <Link href="/cart" className="flex items-center gap-2 text-neutral-800 font-medium py-2 border-b border-neutral-50">
                <ShoppingCart className="w-5 h-5" /> Cart ({cartCount})
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-neutral-800 font-medium py-2 border-b border-neutral-50">Profile</Link>
                  {user.role !== 'Customer' && (
                    <Link href={`/${user.role.toLowerCase().replace(' ', '')}-dashboard`} className="text-neutral-800 font-medium py-2 border-b border-neutral-50">Dashboard</Link>
                  )}
                  <button onClick={logout} className="text-red-600 font-medium py-2 text-left">Logout</button>
                </>
              ) : (
                <Link href="/login" className="btn-primary text-center mt-2">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
