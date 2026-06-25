"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Tag, Eye } from 'lucide-react';

export default function ProductsManagement() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('category-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const isAuthorized = user.role === 'Super Admin' || permissions.includes('products');
      if (!isAuthorized) {
        router.push('/');
      } else {
        fetchProducts();
        fetchCategories();
      }
    }
  }, [user, permissions, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy]);

  if (!user) return null;

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter !== 'All Categories') {
      const pCatName = product.category?.name || product.categoryName || '';
      matchesCategory = pCatName.toLowerCase() === categoryFilter.toLowerCase();
    }

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'category-asc') {
      const catA = (a.category?.name || a.categoryName || '').toLowerCase();
      const catB = (b.category?.name || b.categoryName || '').toLowerCase();
      return catA.localeCompare(catB);
    } else if (sortBy === 'category-desc') {
      const catA = (a.category?.name || a.categoryName || '').toLowerCase();
      const catB = (b.category?.name || b.categoryName || '').toLowerCase();
      return catB.localeCompare(catA);
    } else if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    } else if (sortBy === 'price-asc') {
      return (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'price-desc') {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Products Management</h2>
          <p className="text-neutral-500 font-medium">Manage your catalog, inventory, and pricing</p>
        </div>
        <button 
          onClick={() => router.push('/superadmin-dashboard/products/new')}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search products by name, SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-medium text-neutral-700 w-full sm:w-auto"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-medium text-neutral-700 w-full sm:w-auto"
            >
              <option value="category-asc">Sort: Category (A-Z)</option>
              <option value="category-desc">Sort: Category (Z-A)</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs font-bold text-neutral-800 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-800 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-808 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-808 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-808 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">Loading products...</td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">No products found.</td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200" style={{ width: '48px', height: '48px' }}>
                          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} style={{ width: '48px', height: '48px', objectFit: 'cover' }} alt="" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 mb-0">{product.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-1">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {product.category?.name || product.categoryName || 'Uncategorized'}</span>
                            {product.store && <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-bold">Store: {product.store.name}</span>}
                            {product.addedBy && <span className="text-neutral-400 font-medium">| By: {product.addedBy.name}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.discountPrice ? (
                        <div>
                          <span className="font-bold text-primary mr-2">₹{product.discountPrice}</span>
                          <span className="text-sm text-neutral-400 line-through">₹{product.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-primary">₹{product.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock > 20 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : product.stock > 0 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => router.push(`/products/${product.slug}`)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.push(`/superadmin-dashboard/products/${product._id}/edit`)}
                        className="p-2 text-neutral-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 mr-1" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-100 flex justify-between items-center text-sm text-neutral-500 bg-neutral-50/30">
          <span>
            Showing {filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          <div className="flex gap-1 flex-wrap">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 text-sm font-medium"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  currentPage === page 
                    ? 'bg-primary text-white' 
                    : 'border border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
