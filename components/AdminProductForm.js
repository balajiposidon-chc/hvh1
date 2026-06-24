"use client";
import { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { Upload, Trash2 } from 'lucide-react';

export default function AdminProductForm({ initialData, action }) {
    const [form, setForm] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        discountPrice: initialData?.discountPrice || '',
        category: initialData?.category || '',
        brand: initialData?.brand || '',
        stock: initialData?.stock || '0',
        images: initialData?.images || '',
        status: initialData?.status || 'active',
        featured: initialData?.featured || false,
        store: initialData?.store || '',
        unit: initialData?.unit || 'piece',
        weight: initialData?.weight || '',
        hsnCode: initialData?.hsnCode || '',
        gstRate: initialData?.gstRate || '5',
        culinaryUses: initialData?.culinaryUses || '',
        storageCare: initialData?.storageCare || '',
        sourcingGuarantee: initialData?.sourcingGuarantee || '',
        allergenSafety: initialData?.allergenSafety || '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [changedFieldsList, setChangedFieldsList] = useState([]);

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

    const detectHsnAndGst = (nameValue) => {
        const nameLower = nameValue.toLowerCase();
        
        // HSN & GST Mapping
        const hsnMap = [
            { keywords: ['cardamom', 'elaichi'], hsn: '0908', gst: '5' },
            { keywords: ['pepper', 'kurumulaku'], hsn: '0904', gst: '5' },
            { keywords: ['clove', 'grampoo'], hsn: '0907', gst: '5' },
            { keywords: ['nutmeg', 'jathikka'], hsn: '0908', gst: '5' },
            { keywords: ['cinnamon', 'karuvapatta'], hsn: '0906', gst: '5' },
            { keywords: ['ginger', 'inji'], hsn: '0910', gst: '5' },
            { keywords: ['turmeric', 'manjal'], hsn: '0910', gst: '5' },
            { keywords: ['saffron', 'kesar'], hsn: '0910', gst: '5' },
            { keywords: ['vanilla'], hsn: '0905', gst: '5' },
            { keywords: ['tea', 'chai'], hsn: '0902', gst: '5' },
            { keywords: ['coffee', 'kaapi'], hsn: '0901', gst: '5' },
            { keywords: ['honey', 'then'], hsn: '0409', gst: '5' },
            { keywords: ['dry fruit', 'cashew', 'almond', 'badam'], hsn: '0801', gst: '12' },
            { keywords: ['oil', 'essential oil', 'massage oil'], hsn: '3301', gst: '18' },
            { keywords: ['chocolate', 'cocoa'], hsn: '1806', gst: '18' },
            { keywords: ['jam', 'sauce', 'butter', 'spread'], hsn: '2007', gst: '12' },
            { keywords: ['soap', 'shampoo', 'cosmetic'], hsn: '3401', gst: '18' },
        ];
        
        // Tips & Recommendations Mapping
        const tipsMap = [
            {
                keywords: ['cardamom', 'elaichi', 'pepper', 'kurumulaku', 'clove', 'grampoo', 'nutmeg', 'jathikka', 'cinnamon', 'karuvapatta', 'ginger', 'inji', 'turmeric', 'manjal', 'saffron', 'kesar', 'vanilla', 'tea', 'chai', 'coffee', 'kaapi'],
                culinaryUses: "Perfect for brewing aromatic chais, baking sweet pastries, or flavoring high-end savory curry sauces and rice dishes.",
                storageCare: "Keep inside an airtight glass container, stored in a cool, dry, dark cupboard away from direct sunshine to retain natural essential oils and aroma.",
                sourcingGuarantee: "Ethically hand-picked from premium organic estates in high-altitude zones, dried in temperature-controlled spaces to protect flavor retention.",
                allergenSafety: "Gluten-free, vegan-safe, and processed in a 100% peanut-free hygienic corporate packing environment."
            },
            {
                keywords: ['honey', 'then'],
                culinaryUses: "Excellent as a natural sweetener for tea and coffee, drizzled over desserts, or used in salad dressings and marinades.",
                storageCare: "Store at room temperature in a sealed container. Do not refrigerate. If crystallization occurs, place the jar in warm water.",
                sourcingGuarantee: "100% pure, unfiltered raw honey sourced directly from wild forest hives and local apiaries under sustainable practices.",
                allergenSafety: "100% natural, contains no additives. Not recommended for infants under 1 year of age."
            },
            {
                keywords: ['dry fruit', 'cashew', 'almond', 'badam', 'nuts'],
                culinaryUses: "Great for healthy snacking, adding to morning oatmeal, baking, or garnishing desserts and pilaf rice.",
                storageCare: "Store in a cool, dry place. Best kept in a sealed airtight container in the refrigerator to prevent rancidity and maintain crunch.",
                sourcingGuarantee: "Carefully sorted and grade-A selected from trusted orchard farms to ensure uniform size and premium quality.",
                allergenSafety: "Contains tree nuts. Processed in a facility that handles other nuts and sesame."
            },
            {
                keywords: ['oil', 'essential oil', 'massage oil'],
                culinaryUses: "For external use, aromatherapy, massage, or diluting with carrier oils. Check specific labels for culinary applicability.",
                storageCare: "Store in a cool, dark place in amber glass bottles. Keep away from heat, open flames, and direct sunlight.",
                sourcingGuarantee: "100% pure therapeutic-grade oil extracted using traditional steam distillation or cold-press extraction methods.",
                allergenSafety: "Highly concentrated. Conduct a patch test before skin application. Keep out of reach of children."
            },
            {
                keywords: ['chocolate', 'cocoa'],
                culinaryUses: "Perfect for chocolate desserts, hot cocoa drinks, baking recipes, or direct gourmet snacking.",
                storageCare: "Store in a cool, dry place (15-18°C) away from strong odors and heat sources to prevent fat bloom.",
                sourcingGuarantee: "Crafted from fine-flavor single-origin cocoa beans sourced via fair-trade partnerships with local farming co-operatives.",
                allergenSafety: "May contain trace amounts of milk solids, soy lecithin, and nuts depending on the specific batch recipe."
            },
            {
                keywords: ['jam', 'sauce', 'butter', 'spread'],
                culinaryUses: "Ideal as a breakfast spread on toasted bread, topping for pancakes, waffles, yogurt, or as dessert fillings.",
                storageCare: "Refrigerate after opening. Consume within 4 weeks of opening. Always use a clean spoon.",
                sourcingGuarantee: "Made from fresh, sun-ripened regional fruits cooked in small batches to preserve original taste and texture.",
                allergenSafety: "Contains fruit ingredients. Free from artificial colors, preservatives, and high-fructose corn syrup."
            },
            {
                keywords: ['soap', 'shampoo', 'cosmetic'],
                culinaryUses: "For external body, hair, and skincare use. Lather well with water and rinse thoroughly.",
                storageCare: "Keep on a draining soap dish between uses to keep it dry and extend its lifespan.",
                sourcingGuarantee: "Handmade using natural plant-derived saponified oils, botanical extracts, and essential oils.",
                allergenSafety: "Contains natural essential oils. Discontinue use if irritation or skin redness occurs."
            }
        ];

        const matchedHsn = hsnMap.find(item => item.keywords.some(k => nameLower.includes(k)));
        const matchedTips = tipsMap.find(item => item.keywords.some(k => nameLower.includes(k)));

        const fallbackTips = {
            culinaryUses: "Versatile usage. Ideal for everyday culinary preparation or personal care depending on product type.",
            storageCare: "Keep in a cool, dry place inside an airtight container away from direct sunlight and humidity.",
            sourcingGuarantee: "Quality guaranteed and sourced from verified regional partners conforming to standard quality control.",
            allergenSafety: "Processed under hygienic conditions. Please check specific packaging labels for allergens."
        };

        const targetTips = matchedTips || fallbackTips;

        setForm((current) => ({
            ...current,
            hsnCode: current.hsnCode ? current.hsnCode : (matchedHsn ? matchedHsn.hsn : ''),
            gstRate: current.gstRate && current.gstRate !== '5' ? current.gstRate : (matchedHsn ? matchedHsn.gst : '5'),
            culinaryUses: current.culinaryUses ? current.culinaryUses : targetTips.culinaryUses,
            storageCare: current.storageCare ? current.storageCare : targetTips.storageCare,
            sourcingGuarantee: current.sourcingGuarantee ? current.sourcingGuarantee : targetTips.sourcingGuarantee,
            allergenSafety: current.allergenSafety ? current.allergenSafety : targetTips.allergenSafety,
        }));
    };

    const handleChange = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
        if (key === 'name') {
            detectHsnAndGst(value);
        }
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
            gstRate: Number(form.gstRate),
            images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
        };
        
        // Track changed fields
        if (action !== 'create') {
            const fields = [
                { key: 'name', label: 'Product Name' },
                { key: 'slug', label: 'Slug / URL Path' },
                { key: 'description', label: 'Description' },
                { key: 'price', label: 'Standard Price' },
                { key: 'discountPrice', label: 'Discounted Price' },
                { key: 'category', label: 'Category' },
                { key: 'brand', label: 'Brand Name' },
                { key: 'stock', label: 'Stock Level' },
                { key: 'images', label: 'Product Images' },
                { key: 'status', label: 'Status' },
                { key: 'featured', label: 'Featured Switch' },
                { key: 'store', label: 'Assigned Store' },
                { key: 'unit', label: 'Selling Unit' },
                { key: 'weight', label: 'Product Weight' },
                { key: 'hsnCode', label: 'HSN Code' },
                { key: 'gstRate', label: 'GST Rate (%)' },
                { key: 'culinaryUses', label: 'Culinary Uses' },
                { key: 'storageCare', label: 'Storage & Care' },
                { key: 'sourcingGuarantee', label: 'Sourcing Guarantee' },
                { key: 'allergenSafety', label: 'Allergen & Safety' }
            ];
            const changed = [];
            fields.forEach(({ key, label }) => {
                const initialVal = initialData?.[key] !== undefined && initialData?.[key] !== null ? String(initialData[key]).trim() : '';
                const currentVal = form[key] !== undefined && form[key] !== null ? String(form[key]).trim() : '';
                if (initialVal !== currentVal) {
                    changed.push(label);
                }
            });
            setChangedFieldsList(changed);
        } else {
            setChangedFieldsList([]);
        }

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
        setShowSuccessModal(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Name <span className="text-red-500 font-bold">*</span></span>
                    <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Slug <span className="text-red-500 font-bold">*</span></span>
                    <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required />
                </label>
            </div>
            
            <label className="block">
                <span className="text-sm text-slate-700 font-semibold">Description <span className="text-red-500 font-bold">*</span></span>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none mt-2" required />
            </label>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Price <span className="text-red-500 font-bold">*</span></span>
                    <Input type="text" value={form.price} onChange={(e) => handleChange('price', e.target.value)} required />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Discount price</span>
                    <Input type="text" value={form.discountPrice} onChange={(e) => handleChange('discountPrice', e.target.value)} />
                </label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Category <span className="text-red-500 font-bold">*</span></span>
                    <div className="mt-2 relative">
                        <Input 
                            list="category-list"
                            value={form.category} 
                            onChange={(e) => handleChange('category', e.target.value)} 
                            placeholder="Select or type a category..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                            required 
                        />
                    </div>
                    <datalist id="category-list">
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name} />
                        ))}
                    </datalist>
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Brand <span className="text-red-500 font-bold">*</span></span>
                    <Input value={form.brand} onChange={(e) => handleChange('brand', e.target.value)} required />
                </label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Stock <span className="text-red-500 font-bold">*</span></span>
                    <Input type="text" value={form.stock} onChange={(e) => handleChange('stock', e.target.value)} required />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Quantity Unit <span className="text-red-500 font-bold">*</span></span>
                    <select
                        value={form.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none cursor-pointer"
                        required
                    >
                        <option value="piece">Piece (pc)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="mg">Milligram (mg)</option>
                        <option value="l">Liter (l)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="pack">Pack</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Package Capacity / Weight</span>
                    <Input type="text" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="e.g. 200g, 250g, 1L" />
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">HSN Code</span>
                    <Input value={form.hsnCode} onChange={(e) => handleChange('hsnCode', e.target.value)} placeholder="e.g. 0908" />
                </label>
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">GST Rate (%) <span className="text-red-500 font-bold">*</span></span>
                    <select
                        value={form.gstRate}
                        onChange={(e) => handleChange('gstRate', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none cursor-pointer"
                        required
                    >
                        <option value="0">0% (Nil Rated)</option>
                        <option value="5">5% (Spices & Essentials)</option>
                        <option value="12">12% (Processed Foods / Nuts)</option>
                        <option value="18">18% (Oils & Cosmetics)</option>
                        <option value="28">28% (Luxury Goods)</option>
                    </select>
                </label>
            </div>
            
            <div className="space-y-1">
                <span className="text-sm text-slate-700 block font-semibold">Product Images</span>
                <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl p-3 hover:border-primary cursor-pointer transition bg-slate-50 hover:bg-slate-100/50 mt-2">
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

            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Image URLs</span>
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

            <div className="space-y-4 border-t border-slate-100 pt-6">
                <span className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-2 mb-4 block">Cooking Tips & Recommendations</span>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-sm text-slate-700 font-semibold">Suggested Culinary Uses</span>
                        <textarea
                            value={form.culinaryUses}
                            onChange={(e) => handleChange('culinaryUses', e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-y"
                            rows={3}
                            placeholder="Perfect for brewing aromatic chais..."
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-700 font-semibold">Storage & Care</span>
                        <textarea
                            value={form.storageCare}
                            onChange={(e) => handleChange('storageCare', e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-y"
                            rows={3}
                            placeholder="Keep inside an airtight glass container..."
                        />
                    </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-sm text-slate-700 font-semibold">Authentic Sourcing Guarantee</span>
                        <textarea
                            value={form.sourcingGuarantee}
                            onChange={(e) => handleChange('sourcingGuarantee', e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-y"
                            rows={3}
                            placeholder="Ethically hand-picked from family estates..."
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-slate-700 font-semibold">Allergen Safety</span>
                        <textarea
                            value={form.allergenSafety}
                            onChange={(e) => handleChange('allergenSafety', e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-y"
                            rows={3}
                            placeholder="Gluten-free, vegan-safe..."
                        />
                    </label>
                </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm text-slate-700 font-semibold">Status <span className="text-red-500 font-bold">*</span></span>
                    <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>
                <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 mt-2 sm:mt-0 cursor-pointer select-none">
                    <input type="checkbox" checked={form.featured} onChange={(e) => handleChange('featured', e.target.checked)} className="h-4 w-4" />
                    <span className="text-sm text-slate-700 font-semibold">Featured product</span>
                </label>
            </div>
            
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            
            <Button type="submit" disabled={loading}>{action === 'create' ? 'Create product' : 'Save changes'}</Button>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-neutral-100 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                            <span className="text-3xl font-extrabold">✓</span>
                        </div>
                        <div>
                            <h4 className="text-2xl font-extrabold text-neutral-950">Success!</h4>
                            <p className="text-neutral-500 text-sm mt-2">
                                {action === 'create' ? 'Product created successfully' : 'Product updated successfully'}
                            </p>
                            {changedFieldsList.length > 0 ? (
                                <div className="text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100 max-h-40 overflow-y-auto text-xs mt-3">
                                    <span className="font-semibold text-neutral-700 d-block mb-1.5">Modified Fields:</span>
                                    <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                                        {changedFieldsList.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                action !== 'create' && (
                                    <p className="text-xs text-neutral-400 mt-2 italic">No fields were modified.</p>
                                )
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setShowSuccessModal(false);
                                const storeId = initialData?.store || '';
                                const basePath = window.location.pathname.startsWith('/store-panel') ? '/store-panel/products' : '/superadmin-dashboard/products';
                                window.location.href = storeId ? `${basePath}?storeId=${storeId}` : basePath;
                            }}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 border-0 cursor-pointer"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
