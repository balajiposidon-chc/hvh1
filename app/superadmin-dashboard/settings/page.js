"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, Palette, Layout, Settings, Sparkles } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [storeName, setStoreName] = useState('');
  const [logo, setLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [taxRate, setTaxRate] = useState(5);
  const [shippingFee, setShippingFee] = useState(0);
  
  // Customizer states
  const [themeMode, setThemeMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#D2143A');
  const [bgColor, setBgColor] = useState('#F8F9FA');
  const [fontColor, setFontColor] = useState('#1A1A1A');
  const [bigFontColor, setBigFontColor] = useState('#1A1A1A');
  const [smallFontColor, setSmallFontColor] = useState('#555555');
  
  // Hero CMS states
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroBtnText, setHeroBtnText] = useState('');
  const [heroBtnLink, setHeroBtnLink] = useState('');

  // Social Links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  useEffect(() => {
    if (user) {
      const isAuthorized = user.role === 'Super Admin' || permissions.includes('settings');
      if (!isAuthorized) {
        router.push('/');
      } else {
        fetchSettings();
      }
    }
  }, [user, permissions, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setStoreName(s.storeName || '');
        setLogo(s.logo || '');
        setContactEmail(s.contactEmail || '');
        setPhone(s.phone || '');
        setAddress(s.address || '');
        setCurrency(s.currency || 'INR');
        setTaxRate(s.taxRate || 0);
        setShippingFee(s.shippingFee || 0);
        
        setThemeMode(s.themeMode || 'light');
        setPrimaryColor(s.primaryColor || '#D2143A');
        setBgColor(s.bgColor || '#F8F9FA');
        setFontColor(s.fontColor || '#1A1A1A');
        setBigFontColor(s.bigFontColor || s.fontColor || '#1A1A1A');
        setSmallFontColor(s.smallFontColor || '#555555');
        
        setHeroTitle(s.heroTitle || '');
        setHeroSubtitle(s.heroSubtitle || '');
        setHeroImage(s.heroImage || '');
        setHeroBtnText(s.heroBtnText || '');
        setHeroBtnLink(s.heroBtnLink || '');

        setFacebook(s.socialLinks?.facebook || '');
        setInstagram(s.socialLinks?.instagram || '');
        setTwitter(s.socialLinks?.twitter || '');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch settings from server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    
    // Auto calculate preset theme background and text colors if they are not overridden manually
    // but here we let the pickers send whatever they chose.
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          logo,
          contactEmail,
          phone,
          address,
          currency,
          taxRate,
          shippingFee,
          themeMode,
          primaryColor,
          bgColor,
          fontColor,
          bigFontColor,
          smallFontColor,
          heroTitle,
          heroSubtitle,
          heroImage,
          heroBtnText,
          heroBtnLink,
          facebook,
          instagram,
          twitter
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Settings and Customizations saved successfully! Refreshing pages...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const applyThemePreset = (mode) => {
    setThemeMode(mode);
    if (mode === 'light') {
      setBgColor('#F8F9FA');
      setFontColor('#1A1A1A');
      setBigFontColor('#1A1A1A');
      setSmallFontColor('#555555');
    } else {
      setBgColor('#12100E');
      setFontColor('#E7E5E4');
      setBigFontColor('#E7E5E4');
      setSmallFontColor('#A3A3A3');
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Store customizer</h2>
          <p className="text-neutral-500 font-medium">Configure store settings, switch themes, manage color variables, and customize the landing hero banner.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm">Loading settings details...</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Theme & Palette Customizer */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-6">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <span>Theme & Color Palette</span>
              </h5>
              
              <div>
                <label className="form-label text-neutral-700 small fw-semibold d-block mb-2">Fulfillment Theme Mode</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => applyThemePreset('light')}
                    className={`flex-1 py-3.5 rounded-2xl border-2 font-bold transition-all text-center ${
                      themeMode === 'light' 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    ☀️ Light Theme Mode
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyThemePreset('dark')}
                    className={`flex-1 py-3.5 rounded-2xl border-2 font-bold transition-all text-center ${
                      themeMode === 'dark' 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    🌙 Dark Theme Mode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <label className="form-label text-neutral-700 small fw-semibold d-block mb-2">Primary Accent Color</label>
                  <div className="flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="form-control rounded-xl p-2 text-xs border border-neutral-200 uppercase"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <label className="form-label text-neutral-700 small fw-semibold d-block mb-2">Body Background Color</label>
                  <div className="flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                      className="form-control rounded-xl p-2 text-xs border border-neutral-200 uppercase"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <label className="form-label text-neutral-700 small fw-semibold d-block mb-2">Big Text Font Color</label>
                  <div className="flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={bigFontColor} 
                      onChange={(e) => setBigFontColor(e.target.value)} 
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={bigFontColor} 
                      onChange={(e) => setBigFontColor(e.target.value)} 
                      className="form-control rounded-xl p-2 text-xs border border-neutral-200 uppercase"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <label className="form-label text-neutral-700 small fw-semibold d-block mb-2">Small Text Font Color</label>
                  <div className="flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={smallFontColor} 
                      onChange={(e) => setSmallFontColor(e.target.value)} 
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={smallFontColor} 
                      onChange={(e) => setSmallFontColor(e.target.value)} 
                      className="form-control rounded-xl p-2 text-xs border border-neutral-200 uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Homepage Hero Section CMS */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <span>Homepage Hero Banner Editor</span>
              </h5>
              
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Hero Heading Title</label>
                <input 
                  type="text" 
                  value={heroTitle} 
                  onChange={(e) => setHeroTitle(e.target.value)} 
                  placeholder="Sourced from Nature, Perfected by Tradition"
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Hero Subtitle Paragraph</label>
                <textarea 
                  value={heroSubtitle} 
                  onChange={(e) => setHeroSubtitle(e.target.value)} 
                  rows={4}
                  placeholder="Enter details describing the organic spices estate sourcing..."
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Hero Banner Image URL</label>
                <input 
                  type="text" 
                  value={heroImage} 
                  onChange={(e) => setHeroImage(e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..."
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Call to Action Button Text</label>
                  <input 
                    type="text" 
                    value={heroBtnText} 
                    onChange={(e) => setHeroBtnText(e.target.value)} 
                    placeholder="Explore Collection"
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">CTA Button Redirection Link</label>
                  <input 
                    type="text" 
                    value={heroBtnLink} 
                    onChange={(e) => setHeroBtnLink(e.target.value)} 
                    placeholder="/products"
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Store Branding & Parameters</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Store name</label>
                  <input 
                    type="text" 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Branding Logo URL</label>
                  <input 
                    type="text" 
                    value={logo} 
                    onChange={(e) => setLogo(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail} 
                    onChange={(e) => setContactEmail(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Contact Phone</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Business Address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Currency Code</label>
                  <input 
                    type="text" 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Sales Tax Rate (%)</label>
                  <input 
                    type="number" 
                    value={taxRate} 
                    onChange={(e) => setTaxRate(Number(e.target.value))} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Flat Shipping Fee (₹)</label>
                  <input 
                    type="number" 
                    value={shippingFee} 
                    onChange={(e) => setShippingFee(Number(e.target.value))} 
                    className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Social settings */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-3 d-flex align-items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Social Network Links</span>
              </h5>
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Facebook URL</label>
                <input 
                  type="text" 
                  value={facebook} 
                  onChange={(e) => setFacebook(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                />
              </div>
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Instagram URL</label>
                <input 
                  type="text" 
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                />
              </div>
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Twitter URL</label>
                <input 
                  type="text" 
                  value={twitter} 
                  onChange={(e) => setTwitter(e.target.value)} 
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                />
              </div>
            </div>

            {error && <div className="alert alert-danger p-3 rounded-2xl text-xs">{error}</div>}
            {message && <div className="alert alert-success p-3 rounded-2xl text-xs">{message}</div>}

            <button 
              type="submit"
              disabled={saving}
              className="btn btn-cherry w-full py-3.5 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
            >
              <Save size={18} />
              <span>{saving ? 'Saving changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
