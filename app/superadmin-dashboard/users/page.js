"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit2, Trash2, Search, UserCheck, ShieldAlert, Save } from 'lucide-react';

export default function UserAccountsManager() {
  const { user: currentSuperAdmin } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Form states
  const [userId, setUserId] = useState(null); // null means adding new
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [status, setStatus] = useState('active');
  const [editMode, setEditMode] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentSuperAdmin && currentSuperAdmin.role !== 'Super Admin') {
      router.push('/');
    } else if (currentSuperAdmin) {
      fetchUsersAndRoles();
    }
  }, [currentSuperAdmin, router]);

  const fetchUsersAndRoles = async () => {
    try {
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      const rolesRes = await fetch('/api/admin/roles');
      const rolesData = await rolesRes.json();
      if (rolesData.success) {
        setRoles(rolesData.roles);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setUserId(user._id);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank
    setRole(user.role);
    setStatus(user.status || 'active');
    setEditMode(true);
    setError('');
    setMessage('');
  };

  const handleCancelEdit = () => {
    setUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Customer');
    setStatus('active');
    setEditMode(false);
    setError('');
    setMessage('');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || (!userId && !password.trim())) {
      setError('Name, email, and password are required for new accounts.');
      return;
    }
    setError('');
    setMessage('');
    setSaving(true);

    try {
      if (userId) {
        // Edit User
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, status })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('User account modified successfully.');
          handleCancelEdit();
          fetchUsersAndRoles();
        } else {
          setError(data.message || 'Failed to modify account');
        }
      } else {
        // Create User
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, status })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('User account created successfully.');
          handleCancelEdit();
          fetchUsersAndRoles();
        } else {
          setError(data.message || 'Failed to create account');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserBlock = async (userToUpdate) => {
    setError('');
    setMessage('');
    const newStatus = userToUpdate.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userToUpdate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userToUpdate._id ? { ...u, status: newStatus } : u));
        setMessage(`Account status updated to ${newStatus}.`);
      } else {
        const data = await res.json();
        setError(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (email === 'admin@store.com' || email === currentSuperAdmin.email) {
      setError('Main administrator account or your own login cannot be deleted.');
      return;
    }
    if (!confirm('Are you sure you want to delete this user account permanently?')) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== id));
        setMessage('User account deleted.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    }
  };

  // Get available role list (predefined + custom roles)
  const defaultRoles = ['Super Admin', 'Admin', 'Store Manager', 'Accountant', 'Customer'];
  const allRoles = Array.from(new Set([...defaultRoles, ...roles.map(r => r.name)]));

  if (!currentSuperAdmin) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Accounts Directory</h2>
          <p className="text-neutral-500 font-medium">Oversee logins, add store managers, accountants, custom roles, block logins, and modify access credentials.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm">Loading users list...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Accounts list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Active User Accounts</span>
              </h5>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Account name</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Role Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">No user accounts found in records.</td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-neutral-900">{item.name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-white">
                              {item.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                              {item.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                            <button 
                              onClick={() => handleEditUser(item)}
                              className="btn btn-sm btn-primary py-1 px-3 rounded-pill text-xs font-bold d-inline-flex align-items-center gap-1"
                              title="Edit User"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => toggleUserBlock(item)}
                              className={`btn btn-sm py-1 px-3 rounded-pill text-xs font-bold d-inline-flex align-items-center gap-1 ${
                                item.status === 'active' ? 'btn-warning' : 'btn-outline-success'
                              }`}
                              title={item.status === 'active' ? 'Block Account' : 'Unblock Account'}
                            >
                              {item.status === 'active' ? <ShieldAlert size={12} /> : <UserCheck size={12} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(item._id, item.email)}
                              className="btn btn-sm btn-danger py-1 px-3 rounded-pill text-xs font-bold d-inline-flex align-items-center gap-1"
                              title="Delete Account"
                              disabled={item.email === 'admin@store.com' || item.email === currentSuperAdmin.email}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add / Edit Form */}
          <div className="space-y-6">
            <form onSubmit={handleSaveUser} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>{editMode ? 'Edit Account Role' : 'Create Account'}</span>
              </h5>

              {!editMode && (
                <>
                  <div>
                    <label className="form-label text-neutral-700 small fw-semibold">Account Owner Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. John Doe"
                      className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label text-neutral-700 small fw-semibold">Login Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="e.g. john@store.com"
                      className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label text-neutral-700 small fw-semibold">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Set account password"
                      className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Assign Role Profile</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="form-select rounded-xl p-3 bg-neutral-50 border-0 text-sm outline-none w-full"
                >
                  {allRoles.map((rName) => (
                    <option key={rName} value={rName}>{rName}</option>
                  ))}
                </select>
              </div>

              {editMode && (
                <div>
                  <label className="form-label text-neutral-700 small fw-semibold">Account Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="form-select rounded-xl p-3 bg-neutral-50 border-0 text-sm outline-none w-full"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              )}

              {error && <div className="alert alert-danger p-3 rounded-2xl text-xs">{error}</div>}
              {message && <div className="alert alert-success p-3 rounded-2xl text-xs">{message}</div>}

              <div className="flex gap-2 pt-2">
                {editMode && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="btn btn-outline-secondary w-full py-3 rounded-pill fw-bold text-xs"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={saving}
                  className="btn btn-cherry w-full py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1.5 text-xs"
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : editMode ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
