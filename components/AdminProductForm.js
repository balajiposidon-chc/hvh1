"use client";
import { useState } from 'react';
import Button from './Button';
import Input from './Input';
export default function AdminProductForm({ initialData, action }) {
    const [form, setForm] = useState(initialData ?? {
        name: '', slug: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '0', images: '', status: 'active', featured: false,
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        const payload = {
            ...form,
            price: Number(form.price),
            discountPrice: Number(form.discountPrice),
            stock: Number(form.stock),
            images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
        };
        const url = action === 'create' ? '/api/admin/products' : `/api/admin/products/${initialData?.id}`;
        const method = action === 'create' ? 'POST' : 'PUT';
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
            setError(data.message || 'Unable to save product');
            return;
        }
        setMessage('Product saved successfully.');
    };
    return (<form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Name</span>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Slug</span>
          <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required/>
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-slate-700">Description</span>
        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" required/>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Price</span>
          <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Discount price</span>
          <Input type="number" value={form.discountPrice} onChange={(e) => handleChange('discountPrice', e.target.value)}/>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Category</span>
          <Input value={form.category} onChange={(e) => handleChange('category', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Brand</span>
          <Input value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} required/>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Stock</span>
          <Input type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Image URLs</span>
          <Input value={form.images} onChange={(e) => handleChange('images', e.target.value)} placeholder="https://... , https://..."/>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Status</span>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input type="checkbox" checked={form.featured} onChange={(e) => handleChange('featured', e.target.checked)} className="h-4 w-4"/>
          <span className="text-sm text-slate-700">Featured product</span>
        </label>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <Button type="submit" disabled={loading}>{action === 'create' ? 'Create product' : 'Save changes'}</Button>
    </form>);
}
