"use client";
import { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { Upload, Trash2 } from 'lucide-react';

export default function AdminProductForm({ initialData, action }) {
    const [form, setForm] = useState(initialData ?? {
        name: '', slug: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '0', images: '', status: 'active', featured: false,
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success && data.categories) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        }
        fetchCategories();
    }, []);

    const handleChange = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        setError('');
        setMessage('');

        const newUrls = [];
        try {
            for (const file of files) {
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (err) => reject(err);
                });
                reader.readAsDataURL(file);
                const base64Data = await base64Promise;

                const res = await fetch('/api/uploads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Data })
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Upload failed');
                }
                newUrls.push(data.url);
            }

            const currentImages = form.images
                ? form.images.split(',').map(i => i.trim()).filter(Boolean)
                : [];
            const updatedImages = [...currentImages, ...newUrls].join(', ');
            handleChange('images', updatedImages);
            setMessage(`Uploaded ${files.length} image(s) successfully.`);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to upload images.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveImage = (urlToRemove) => {
        const currentImages = form.images
            ? form.images.split(',').map(i => i.trim()).filter(Boolean)
            : [];
        const filtered = currentImages.filter(url => url !== urlToRemove);
        handleChange('images', filtered.join(', '));
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Name</span>
                    <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700">Slug</span>
                    <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required />
                </label>
            </div>
            
            <label className="block">
                <span className="text-sm text-slate-700">Description</span>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" required />
            </label>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Price</span>
                    <Input type="number" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700">Discount price</span>
                    <Input type="number" value={form.discountPrice} onChange={(e) => handleChange('discountPrice', e.target.value)} />
                </label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Category</span>
                    <Input 
                        list="category-list"
                        value={form.category} 
                        onChange={(e) => handleChange('category', e.target.value)} 
                        placeholder="Select or type a category..."
                        required 
                    />
                    <datalist id="category-list">
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name} />
                        ))}
                    </datalist>
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700">Brand</span>
                    <Input value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} required />
                </label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Stock</span>
                    <Input type="number" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} required />
                </label>
                <div className="space-y-1">
                    <span className="text-sm text-slate-700 block">Product Images</span>
                    <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl p-3 hover:border-primary cursor-pointer transition bg-slate-50 hover:bg-slate-100/50">
                        <span className="text-sm font-semibold text-slate-600 flex items-center gap-2 select-none">
                            {uploading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="text-slate-500" />
                                    <span>Upload Local Image files</span>
                                </>
                            )}
                        </span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Image URLs (comma-separated)</span>
                    <Input value={form.images} onChange={(e) => handleChange('images', e.target.value)} placeholder="e.g. /uploads/image.png, https://..." />
                </label>
                
                {form.images && (
                    <div className="flex flex-wrap gap-3 mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        {form.images.split(',').map((imgUrl, idx) => {
                            const trimmed = imgUrl.trim();
                            if (!trimmed) return null;
                            return (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white" style={{ width: '80px', height: '80px' }}>
                                    <img src={trimmed} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(trimmed)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity border-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700">Status</span>
                    <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>
                <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 mt-2 sm:mt-0 cursor-pointer select-none">
                    <input type="checkbox" checked={form.featured} onChange={(e) => handleChange('featured', e.target.checked)} className="h-4 w-4" />
                    <span className="text-sm text-slate-700">Featured product</span>
                </label>
            </div>
            
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            
            <Button type="submit" disabled={loading}>{action === 'create' ? 'Create product' : 'Save changes'}</Button>
        </form>
    );
}
