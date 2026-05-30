"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import CustomerLayout from '@/components/CustomerLayout';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    const res = await login(data.email, data.password);
    if (!res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-20 min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-tr-full -z-10"></div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-neutral-800 mb-2">Welcome Back</h2>
              <p className="text-neutral-500">Sign in to your account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input 
                    type="email" 
                    {...register("email", { required: "Email is required" })}
                    className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-neutral-50/50" 
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-neutral-700">Password</label>
                  <Link href="#" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input 
                    type="password" 
                    {...register("password", { required: "Password is required" })}
                    className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-neutral-50/50"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="remember" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
                <label htmlFor="remember" className="ml-2 block text-sm text-neutral-600">Remember me</label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center border-t border-neutral-100 pt-6">
              <p className="text-neutral-500">
                Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-primary/5 rounded-2xl p-4 border border-primary/10 text-center"
          >
            <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1 text-sm text-neutral-600">
              <p><span className="font-semibold">Super Admin:</span> balaji@hillandvalley.com / Balaji@123</p>
              <p><span className="font-semibold">Customer:</span> customer@hillandvalley.com / Customer@123</p>
            </div>
          </motion.div>
        </div>
      </div>
    </CustomerLayout>
  );
}
