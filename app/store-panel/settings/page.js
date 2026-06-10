"use client";

import { useEffect, useState, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Store, Info, Phone, Mail, MapPin } from 'lucide-react';

function StoreSettingsPageContent() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdParam = searchParams.get('storeId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
      if (!isSuperAdmin && !permissions.includes('store-panel')) {
        router.push('/unauthorized');
      } else {
        fetchStoreSettings();
      }
    }
  }, [user, permissions, router, storeIdParam]);

  const fetchStoreSettings = async () => {
    try {
      setLoading(true);
      const url = storeIdParam ? `/api/store-panel/stats?storeId=${storeIdParam}` : '/api/store-panel/stats';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success && result.store) {
        const s = result.store;
        // The store stats API returns store fields. We need to fetch details or we can use these fields.
        // Let's populate the states:
        setStoreId(s.id);
        setName(s.name || '');
        setLocation(s.location || '');
        setStatus(s.status || 'Active');
        
        // Let's fetch the full store details to get contactNumber and email
        const storeDetailRes = await fetch(`/api/stores`);
        const storeDetailData = await storeDetailRes.json();
        if (storeDetailData.success && storeDetailData.stores) {
          const matchedStore = storeDetailData.stores.find(item => item._id === s.id);
          if (matchedStore) {
            setContactNumber(matchedStore.contactNumber || '');
            setEmail(matchedStore.email || '');
          }
        }
      } else {
        setError(result.message || 'Failed to load store settings.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError('Store Name and Location Address are required.');
      return;
    }

    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          contactNumber: contactNumber.trim(),
          email: email.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Store settings updated successfully.');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setError(data.message || 'Failed to save store settings.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'superadmin';
  if (!user || (!permissions.includes('store-panel') && !isSuperAdmin)) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-extrabold text-neutral-900 m-0">Store Settings</h2>
          </div>
          <p className="text-neutral-500 font-medium">Configure store profile details, contact variables, and locations</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm animate-pulse">
          Loading store profile settings details...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 max-w-lg mx-auto mt-12 shadow-sm">
          <h4 className="font-extrabold text-xl mb-2">Error</h4>
          <p className="font-medium text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm space-y-6">
          <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-6 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <span>Store Profile details</span>
          </h5>

          <div>
            <label className="block text-sm text-neutral-700 font-bold mb-2">Store Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hill & Valley Chennai"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary text-neutral-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-700 font-bold mb-2">Location Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. T. Nagar, Chennai"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary text-neutral-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-neutral-700 font-bold mb-2">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary text-neutral-900"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-700 font-bold mb-2">Store Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. chennai@hillandvalley.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary text-neutral-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-3">
            <Info className="w-5 h-5 text-neutral-400 shrink-0" />
            <div className="text-xs text-neutral-500">
              <span className="font-bold">Store Status:</span> {status}. Status settings and manager reassignments can only be completed by the Super Admin in the global Stores manager list.
            </div>
          </div>

          {error && <div className="alert alert-danger p-3 rounded-2xl text-sm bg-red-50 text-red-600 border border-red-100">{error}</div>}
          {message && <div className="alert alert-success p-3 rounded-2xl text-sm bg-emerald-50 text-emerald-600 border border-emerald-100">{message}</div>}

          <button 
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
          </button>
        </form>
      )}
    </AdminLayout>
  );
}

export default function StoreSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Store Settings...</p>
      </div>
    }>
      <StoreSettingsPageContent />
    </Suspense>
  );
}
