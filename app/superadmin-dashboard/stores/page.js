"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, MapPin, Store, CheckCircle, XCircle, Save, X, Phone, Mail, User } from 'lucide-react';

export default function StoresManagement() {
  const { user, permissions } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal and Form States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [storeId, setStoreId] = useState(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');
  const [manager, setManager] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && !permissions.includes('stores')) {
      router.push('/');
    } else if (user) {
      fetchStores();
      fetchUsers();
    }
  }, [user, permissions, router]);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.success) {
        setStores(data.stores);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setStoreId(null);
    setName('');
    setLocation('');
    setContactNumber('');
    setEmail('');
    setStatus('Active');
    setManager('');
    setError('');
    setMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (store) => {
    setIsEdit(true);
    setStoreId(store._id);
    setName(store.name || '');
    setLocation(store.location || '');
    setContactNumber(store.contactNumber || '');
    setEmail(store.email || '');
    setStatus(store.status || 'Active');
    setManager(store.manager?._id || store.manager || '');
    setError('');
    setMessage('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError('Name and Location are required.');
      return;
    }
    setError('');
    setMessage('');
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      location: location.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      status,
      manager: manager || null
    };

    try {
      const url = isEdit ? `/api/stores/${storeId}` : '/api/stores';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(isEdit ? 'Store updated successfully.' : 'Store added successfully.');
        setTimeout(() => {
          setShowModal(false);
          fetchStores();
        }, 1000);
      } else {
        setError(data.message || data.error || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = async (id, storeName) => {
    if (!confirm(`Are you sure you want to delete ${storeName}?`)) return;
    try {
      const res = await fetch(`/api/stores/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchStores();
      } else {
        alert(data.message || 'Failed to delete store');
      }
    } catch (error) {
      console.error(error);
      alert('Connection error');
    }
  };

  // Filter stores based on search query
  const filteredStores = stores.filter(store => 
    store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.manager?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !permissions.includes('stores')) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Stores Management</h2>
          <p className="text-neutral-500 font-medium">Manage physical outlet and franchise profiles</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all w-full md:w-auto"
        >
          <Plus className="w-5 h-5" /> Add New Store
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores by name, location, manager..." 
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-neutral-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Store Info</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">Loading stores...</td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">No stores found.</td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <Store className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 mb-0">{store.name}</p>
                          <p className="text-xs text-neutral-500 mt-1">ID: {store._id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-600 font-medium">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        {store.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-600 font-medium">
                        <User className="w-4 h-4 text-neutral-400" />
                        {store.manager?.name || <span className="text-neutral-400 italic">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        store.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {store.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {store.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user?.role === 'Super Admin' ? (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(store)}
                            className="p-2 text-neutral-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 mr-1" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStore(store._id, store.name)}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-neutral-100 shadow-2xl animate__animated animate__fadeInUp animate__faster">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h5 className="font-bold text-neutral-900 mb-0 d-flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <span>{isEdit ? 'Edit Store Details' : 'Add New Store'}</span>
              </h5>
              <button 
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="p-6 space-y-4">
              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Store Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hill & Valley Chennai"
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm text-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Location Address *</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. T. Nagar, Chennai"
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm text-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      value={contactNumber} 
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="form-control rounded-xl pl-10 pr-3 py-3 bg-neutral-50 border-0 text-sm text-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Store Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. chennai@hillandvalley.com"
                      className="form-control rounded-xl pl-10 pr-3 py-3 bg-neutral-50 border-0 text-sm text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Store Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select rounded-xl p-3 bg-neutral-50 border-0 text-sm outline-none w-full text-neutral-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Assign Store Manager</label>
                  <select 
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="form-select rounded-xl p-3 bg-neutral-50 border-0 text-sm outline-none w-full text-neutral-900"
                  >
                    <option value="">None (Unassigned)</option>
                    {users
                      .filter(u => ['store manager', 'manager', 'admin', 'super admin'].includes(u.role?.toLowerCase()))
                      .map((u) => (
                        <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.role})</option>
                      ))}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-danger p-3 rounded-2xl text-xs">{error}</div>}
              {message && <div className="alert alert-success p-3 rounded-2xl text-xs">{message}</div>}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn btn-outline-secondary w-full py-3 rounded-pill fw-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn btn-cherry w-full py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1.5 text-xs text-white"
                >
                  <Save size={14} />
                  <span>{submitting ? 'Saving...' : 'Save Store'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
