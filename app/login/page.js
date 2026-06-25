"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        setLoading(false);
        if (result?.error) {
            setError(result.error);
        } else {
            window.location.href = '/products';
        }
    };

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container-fluid p-0 flex-grow-1 d-flex flex-column flex-lg-row position-relative">
          {/* Left Pane - Form */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 bg-gold-light relative z-1 animate__animated animate__fadeIn" style={{ minHeight: 'calc(100vh - 90px)' }}>
            <div className="mx-auto w-100" style={{ maxWidth: '480px' }}>
              {/* Back to Home Link */}
              <Link href="/" className="text-decoration-none text-cherry fw-semibold mb-4 d-inline-flex align-items-center gap-2 small">
                <ArrowLeft size={16} /> Back to Home
              </Link>
 
              <div className="glass-card p-4 p-md-5 bg-white shadow-lg border-0" style={{ borderRadius: '24px' }}>
                <div className="text-center mb-4">
                  <img 
                    src="/logo.jpg" 
                    alt="Hill & Valley" 
                    className="rounded-circle object-cover border border-3 mb-3 mx-auto d-block shadow-sm" 
                    style={{ height: '90px', width: '90px', borderColor: 'var(--gold-accent)' }} 
                  />
                  <h1 className="fw-bold text-dark m-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Welcome
                  </h1>
                  <p className="text-muted small mt-2">
                    Access your profile, orders, and checkout securely.
                  </p>
                </div>
 
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-semibold">Email Address</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <Mail size={16} className="text-muted me-2" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                        placeholder="Enter email address"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                    {error && (
                      <div className="text-danger small mt-1 ps-2 fw-semibold" style={{ fontSize: '0.85rem' }}>
                        {error}
                      </div>
                    )}
                  </div>
 
                  {/* Password Input */}
                  <div className="mb-4">
                    <label className="form-label text-dark small fw-semibold">Password</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <Lock size={16} className="text-muted me-2" />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                        placeholder="Enter password"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
 
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn btn-cherry w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    <LogIn size={16} />
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  </button>
                </form>
 
                <hr className="my-4 border-light" />
 
                <p className="text-center text-muted small mb-0">
                  Don't have an account? <Link href="/register" className="font-semibold text-cherry text-decoration-none border-bottom border-cherry pb-0.5">Create account</Link>.
                </p>
              </div>
            </div>
          </div>
 
          {/* Right Pane - Premium Artwork */}
          <div className="col-lg-6 d-none d-lg-block position-relative overflow-hidden" style={{ minHeight: 'calc(100vh - 90px)' }}>
            <img 
              src="/registration_banner.png" 
              alt="Premium Spices & Estate Harvesting" 
              className="position-absolute w-100 h-100 object-cover" 
              style={{ zIndex: 0 }}
            />
            <div className="position-absolute w-100 h-100 top-0 start-0 bg-dark opacity-50" style={{ zIndex: 1 }}></div>
            <div className="position-absolute w-100 h-100 top-0 start-0 d-flex flex-column justify-content-center p-5 text-white" style={{ zIndex: 2 }}>
              <span className="text-uppercase tracking-wider fw-bold text-warning mb-2" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>
                Hill & Valley Estate Spices
              </span>
              <h2 className="display-4 fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Welcome back to our heritage pantry
              </h2>
              <p className="lead text-light mb-0" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Log in to order fresh organic spices, single-origin oils, and premium estate blends directly delivered to your kitchen.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
}
