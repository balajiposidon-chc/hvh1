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
            window.location.href = '/profile';
        }
    };

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 py-5 flex-grow-1 d-flex align-items-center justify-content-center position-relative">
          {/* Decorative background blurs */}
          <div className="position-absolute bg-cherry opacity-5 rounded-circle float-slow" style={{ width: '350px', height: '350px', top: '10%', right: '10%', filter: 'blur(100px)', zIndex: 0 }}></div>
          <div className="position-absolute bg-warning opacity-5 rounded-circle float-slow" style={{ width: '300px', height: '300px', bottom: '10%', left: '10%', filter: 'blur(90px)', zIndex: 0, animationDelay: '-2s' }}></div>

          <div className="col-12 col-md-8 col-lg-5 position-relative z-1 animate__animated animate__fadeIn">
            {/* Back to Home Link */}
            <Link href="/" className="text-decoration-none text-cherry fw-semibold mb-4 d-inline-flex align-items-center gap-2 small">
              <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="glass-card p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <img 
                  src="/logo.jpg" 
                  alt="Hill & Valley" 
                  className="rounded-circle object-cover border border-3 mb-3 mx-auto d-block" 
                  style={{ height: '90px', width: '90px', borderColor: 'var(--gold-accent)' }} 
                />
                <h1 className="fw-bold text-dark m-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Welcome Back
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

                {error && (
                  <div className="alert alert-danger py-2 px-3 rounded-3 small border-0 mb-4" style={{ backgroundColor: '#FFF2F4', color: '#D2143A' }}>
                    Error: {error}
                  </div>
                )}

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
        </main>
        
        <Footer />
      </div>
    );
}
