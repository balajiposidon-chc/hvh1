"use client";

import { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter, ShoppingBag, Loader2, Inbox, ChevronDown } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <CustomerLayout>
      <div className="bg-primary text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 container mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold mb-4">Our Products</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-neutral-200">Discover our premium range of spices and organic coconut products</motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-32">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h5 className="text-xl font-bold text-neutral-800">Filters</h5>
              </div>
              
              <div className="mb-8">
                <h6 className="font-semibold text-neutral-800 mb-4">Categories</h6>
                <div className="space-y-3">
                  {['Spices', 'Coconut Powder', 'Herbal Products'].map((cat, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary" />
                      <span className="text-neutral-600 group-hover:text-primary transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-neutral-100 my-6"></div>
              
              <div className="mb-8">
                <h6 className="font-semibold text-neutral-800 mb-4">Price Range</h6>
                <input type="range" className="w-full accent-primary" min="0" max="5000" />
                <div className="flex justify-between mt-2 text-sm text-neutral-500 font-medium">
                  <span>₹0</span>
                  <span>₹5000</span>
                </div>
              </div>

              <button className="w-full btn-primary py-3 rounded-xl">Apply Filters</button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <p className="text-neutral-500 font-medium">Showing <span className="text-neutral-900 font-bold">{products.length}</span> results</p>
              <div className="relative">
                <select className="appearance-none bg-white border border-neutral-200 text-neutral-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium shadow-sm">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-neutral-500 font-medium">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100 border-dashed">
                <Inbox className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-neutral-700 mb-2">No products found</h4>
                <p className="text-neutral-500">Try adjusting your filters or search criteria.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: (idx % 6) * 0.1 }}
                    key={product._id || idx} 
                    className="group"
                  >
                    <div className="card h-full flex flex-col overflow-hidden">
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        {product.discountPrice && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">SALE</span>}
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={product.name} 
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">{product.category?.name || 'Category'}</p>
                        <h5 className="text-lg font-bold text-neutral-800 mb-3">{product.name}</h5>
                        <div className="mt-auto">
                          <div className="flex items-center gap-3 mb-4">
                            {product.discountPrice ? (
                              <>
                                <span className="text-neutral-400 line-through text-sm">₹{product.price}</span>
                                <span className="text-xl font-bold text-primary">₹{product.discountPrice}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-primary">₹{product.price}</span>
                            )}
                          </div>
                          <button className="w-full bg-neutral-100 hover:bg-primary hover:text-white text-neutral-800 font-semibold py-3 rounded-xl transition-colors duration-300 flex justify-center items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
