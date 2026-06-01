"use client";
import { useState } from 'react';
import Button from './Button';
import Input from './Input';
export default function AdminSettingsForm({ initialSettings }) {
    const [form, setForm] = useState(initialSettings);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        const response = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
            setError(data.message || 'Unable to update settings');
            return;
        }
        setMessage('Settings saved successfully.');
    };
    return (<form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Store name</span>
          <Input value={form.storeName} onChange={(e) => handleChange('storeName', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Logo URL</span>
          <Input value={form.logo} onChange={(e) => handleChange('logo', e.target.value)}/>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Contact email</span>
          <Input value={form.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Phone</span>
          <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} required/>
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-slate-700">Address</span>
        <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} required/>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">Currency</span>
          <Input value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} required/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Tax rate</span>
          <Input type="number" value={form.taxRate} onChange={(e) => handleChange('taxRate', Number(e.target.value))} required/>
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-slate-700">Shipping fee</span>
        <Input type="number" value={form.shippingFee} onChange={(e) => handleChange('shippingFee', Number(e.target.value))} required/>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm text-slate-700">Facebook URL</span>
          <Input value={form.facebook ?? ''} onChange={(e) => handleChange('facebook', e.target.value)}/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Instagram URL</span>
          <Input value={form.instagram ?? ''} onChange={(e) => handleChange('instagram', e.target.value)}/>
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">Twitter URL</span>
          <Input value={form.twitter ?? ''} onChange={(e) => handleChange('twitter', e.target.value)}/>
        </label>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save settings'}</Button>
    </form>);
}
