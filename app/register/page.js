"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, address }),
            });
            const data = await response.json();
            setLoading(false);
            if (!response.ok) {
                setError(data.message || 'Unable to register');
                return;
            }
            setMessage('Account created successfully. You may now log in.');
        } catch (err) {
            console.error("Registration error", err);
            setError('Registration failed. Please check your details.');
            setLoading(false);
        }
    };

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 py-5 flex-grow-1 d-flex align-items-center justify-content-center position-relative">
          {/* Background blurs */}
          <div className="position-absolute bg-cherry opacity-5 rounded-circle float-slow" style={{ width: '350px', height: '350px', top: '10%', right: '10%', filter: 'blur(100px)', zIndex: 0 }}></div>
          <div className="position-absolute bg-warning opacity-5 rounded-circle float-slow" style={{ width: '300px', height: '300px', bottom: '10%', left: '10%', filter: 'blur(90px)', zIndex: 0, animationDelay: '-2s' }}></div>

          <div className="col-12 col-md-8 col-lg-6 position-relative z-1 animate__animated animate__fadeIn">
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
                  Create Account
                </h1>
                <p className="text-muted small mt-2">
                  Register as a customer to start shopping premium spices today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label text-dark small fw-semibold">Full Name</label>
                  <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                    <User size={16} className="text-muted me-2" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required
                      placeholder="Enter full name"
                      className="w-100 border-0 bg-transparent text-sm"
                      style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label text-dark small fw-semibold">Password</label>
                  <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                    <Lock size={16} className="text-muted me-2" />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      placeholder="Create password"
                      className="w-100 border-0 bg-transparent text-sm"
                      style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Phone & Address */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label className="form-label text-dark small fw-semibold">Phone Number</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <Phone size={16} className="text-muted me-2" />
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Phone number"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label text-dark small fw-semibold">Shipping Address</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <MapPin size={16} className="text-muted me-2" />
                      <input 
                        type="text" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="City, State"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 rounded-3 small border-0 mb-4" style={{ backgroundColor: '#FFF2F4', color: '#D2143A' }}>
                    Error: {error}
                  </div>
                )}

                {message && (
                  <div className="alert alert-success py-2 px-3 rounded-3 small border-0 mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                    <CheckCircle size={16} /> <span>{message}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-cherry w-100 py-3 rounded-pill fw-bold"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <hr className="my-4 border-light" />

              <p className="text-center text-muted small mb-0">
                Already have an account? <Link href="/login" className="font-semibold text-cherry text-decoration-none border-bottom border-cherry pb-0.5">Sign In</Link>.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
}
