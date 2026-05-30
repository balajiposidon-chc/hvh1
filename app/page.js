"use client";

import CustomerLayout from '@/components/CustomerLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, ArrowLeftRight, Leaf, Sparkles, Sprout, ShoppingBag } from 'lucide-react';

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden min-h-[80vh] flex items-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-light rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/4"></div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden" animate="visible" variants={fadeIn}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-accent/90 text-neutral-900 px-4 py-2 rounded-full font-bold mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm tracking-wide uppercase">100% Organic & Pure</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                Authentic Spices <br/>
                <span className="text-accent/90">from the Heart of Nature</span>
              </h1>
              <p className="text-lg text-neutral-200 mb-8 max-w-xl leading-relaxed">
                Experience the rich heritage of South Indian flavors with our premium collection of handpicked spices and organic coconut products.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="bg-accent text-neutral-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors hover:shadow-xl hover:shadow-accent/20 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Shop Now
                </Link>
                <Link href="/about" className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/30 hover:bg-white/10 transition-colors">
                  Discover More
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl scale-150"></div>
              <div className="relative rounded-full overflow-hidden border-4 border-white shadow-2xl aspect-square max-w-[500px] mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Premium Spices" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-neutral-100">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
            <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { name: 'Premium Spices', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50' },
              { name: 'Coconut Products', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
              { name: 'Herbal Extracts', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { name: 'Dry Fruits', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' }
            ].map((category, idx) => (
              <motion.div key={idx} variants={fadeIn} className="group cursor-pointer">
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full">
                  <div className={`w-20 h-20 mx-auto rounded-2xl ${category.bg} ${category.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <category.icon className="w-10 h-10" />
                  </div>
                  <h5 className="text-xl font-bold text-neutral-800">{category.name}</h5>
                  <Link href={`/products?category=${category.name.split(' ')[0]}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {category.name}</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
              <div className="w-16 h-1.5 bg-primary rounded-full"></div>
            </div>
            <Link href="/products" className="btn-outline px-8">View All Products</Link>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[1, 2, 3, 4].map((item, idx) => (
              <motion.div key={item} variants={fadeIn} className="group">
                <div className="card h-full overflow-hidden flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">SALE</span>
                    <img 
                      src={`https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt="Product" 
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-neutral-500 text-sm mb-2 font-medium">Spices</p>
                    <h5 className="text-xl font-bold mb-3 text-neutral-800">Premium Cardamom {item}</h5>
                    <div className="flex items-center gap-3 mb-6 mt-auto">
                      <span className="text-neutral-400 line-through text-sm">₹450</span>
                      <span className="text-2xl font-bold text-primary">₹399</span>
                    </div>
                    <button className="w-full bg-neutral-100 hover:bg-primary hover:text-white text-neutral-800 font-semibold py-3 rounded-xl transition-colors duration-300 flex justify-center items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="px-6 py-6 md:py-0">
              <Truck className="w-12 h-12 text-accent mx-auto mb-6" />
              <h5 className="text-xl font-bold mb-3">Free Shipping</h5>
              <p className="text-neutral-400">On all orders over ₹999 across India</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="px-6 py-6 md:py-0">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-6" />
              <h5 className="text-xl font-bold mb-3">Secure Payments</h5>
              <p className="text-neutral-400">100% secure Razorpay payment gateway</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="px-6 py-6 md:py-0">
              <ArrowLeftRight className="w-12 h-12 text-accent mx-auto mb-6" />
              <h5 className="text-xl font-bold mb-3">Easy Returns</h5>
              <p className="text-neutral-400">7 days hassle-free return & refund policy</p>
            </motion.div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
