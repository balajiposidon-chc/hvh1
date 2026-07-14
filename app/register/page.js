"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, CheckCircle, X, Shield } from 'lucide-react';
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

    // OTP states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpLoggedToConsole, setOtpLoggedToConsole] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        // Frontend validation
        if (name.trim().length < 2) {
            setError('Full Name must be at least 2 characters long.');
            return;
        }

        const nameRegex = /^[a-zA-Z\s\-]+$/;
        if (!nameRegex.test(name.trim())) {
            setError('Full Name can only contain letters, spaces, and hyphens.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 8) {
            setError('Password must have at least 8 characters.');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.trim())) {
            setError('Phone number must be exactly 10 numeric digits.');
            return;
        }

        setLoading(true);

        try {
            // Call API to send OTP to email
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(data.message || 'Failed to send OTP verification email. Please try again.');
                return;
            }

            // Check if OTP was logged to console (fallback mode)
            if (data.message && data.message.includes('logged to console')) {
                setOtpLoggedToConsole(true);
            } else {
                setOtpLoggedToConsole(false);
            }

            setOtpCode('');
            setOtpError('');
            setShowOtpModal(true);
        } catch (err) {
            console.error("Error sending OTP", err);
            setError('Failed to send verification code. Please check your internet connection.');
            setLoading(false);
        }
    };

    const handleVerifyOtpAndRegister = async (e) => {
        e.preventDefault();
        
        if (otpCode.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP code.');
            return;
        }

        setOtpError('');
        setOtpLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, address, otp: otpCode }),
            });
            const data = await response.json();
            setOtpLoading(false);

            if (!response.ok) {
                setOtpError(data.message || 'Registration failed');
                return;
            }

            setShowOtpModal(false);
            setMessage('Account created successfully. You may now log in.');
            // Reset fields
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setAddress('');
            setOtpCode('');
        } catch (err) {
            console.error("Registration error", err);
            setOtpError('Registration failed. Please check your connection.');
            setOtpLoading(false);
        }
    };

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container-fluid p-0 flex-grow-1 d-flex flex-column flex-lg-row position-relative">
          {/* Left Pane - Form */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 bg-gold-light relative z-1 animate__animated animate__fadeIn" style={{ minHeight: 'calc(100vh - 90px)' }}>
            <div className="mx-auto w-100" style={{ maxWidth: '520px' }}>
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
                    style={{ height: '80px', width: '80px', borderColor: 'var(--gold-accent)' }} 
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
                    <label className="form-label text-dark small fw-semibold">Full Name *</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <User size={16} className="text-muted me-2" />
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s\-]/g, ''))} 
                        required
                        placeholder="Enter full name (letters and spaces only)"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-semibold">Email Address *</label>
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
                    <label className="form-label text-dark small fw-semibold">Password *</label>
                    <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                      <Lock size={16} className="text-muted me-2" />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                        placeholder="Create password (min 8 chars)"
                        className="w-100 border-0 bg-transparent text-sm"
                        style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Phone & Address */}
                  <div className="row g-3 mb-4">
                    <div className="col-sm-6">
                      <label className="form-label text-dark small fw-semibold">Phone Number *</label>
                      <div className="d-flex align-items-center border rounded-pill px-3 py-2 bg-light">
                        <Phone size={16} className="text-muted me-2" />
                        <input 
                          type="text" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                          required
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
                A Taste of Heritage, Harvested with Care
              </h2>
              <p className="lead text-light mb-0" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Join our exclusive pantry catalog today. Access organically sourced, lab-certified single-origin spices and regional blends straight from family-owned estates.
              </p>
            </div>
          </div>
        </main>

        {/* OTP verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="bg-white rounded-4 p-4 p-md-5 max-w-sm w-full shadow-2xl border border-neutral-100 text-center relative animate__animated animate__fadeInUp animate__faster">
              <button 
                type="button" 
                onClick={() => setShowOtpModal(false)}
                disabled={otpLoading}
                className="btn-close position-absolute top-0 end-0 m-3 border-0 bg-transparent"
                style={{ fontSize: '1.25rem' }}
              >
                <X size={18} className="text-muted" />
              </button>
              
              <div className="mx-auto w-12 h-12 bg-cherry-light text-cherry rounded-circle flex items-center justify-content-center border border-cherry-light mb-4" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Shield size={24} />
              </div>
              
              <h4 className="text-xl font-extrabold text-neutral-950 mb-2">OTP Verification</h4>
              <p className="text-neutral-500 text-sm mb-4">
                We've sent a 6-digit verification code to <strong className="text-dark">{email}</strong>. Please enter it below.
              </p>
              
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div className="mb-3">
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="Enter 6-Digit Code"
                    className="form-control text-center rounded-pill py-2.5 bg-light border-0 fw-bold tracking-wider fs-5"
                    style={{ outline: 'none' }}
                    required
                    disabled={otpLoading}
                  />
                  {otpLoggedToConsole ? (
                    <div className="alert alert-warning py-2 px-3 rounded-3 small border-0 mt-2 text-start" style={{ backgroundColor: '#FFFDF0', color: '#856404', fontSize: '0.8rem' }}>
                      🔑 <strong>No Resend API Key:</strong> Check the server/terminal console logs to get your OTP.
                    </div>
                  ) : (
                    <div className="text-muted small mt-2" style={{ fontSize: '0.8rem' }}>
                      Check your inbox (and spam folder) for the verification code.
                    </div>
                  )}
                </div>

                {otpError && (
                  <div className="text-danger small mt-1 mb-3 ps-2 fw-semibold">
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-100 py-3 bg-cherry hover:bg-cherry-dark text-white font-bold rounded-pill transition-all shadow-lg border-0 cursor-pointer text-sm"
                >
                  {otpLoading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Registering...
                    </span>
                  ) : 'Verify & Register'}
                </button>
              </form>
            </div>
          </div>
        )}
        
        <Footer />
      </div>
    );
}
