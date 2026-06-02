"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Edit2, Trash2, CheckSquare, Square, Save } from 'lucide-react';

export default function RolePermissionManager() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  
  // Form state
  const [roleId, setRoleId] = useState(null); // null means creating
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const allAvailablePermissions = [
    { key: 'dashboard', name: 'Overview Dashboard', desc: 'Allows viewing sales statistics, revenues, and orders summary.' },
    { key: 'products', name: 'Products Management', desc: 'Allows viewing, adding, editing, and deleting items from the catalog.' },
    { key: 'orders', name: 'Orders Management', desc: 'Allows tracking, fulfillment processing, invoice generation, and deleting orders.' },
    { key: 'stores', name: 'Stores Management', desc: 'Allows managing physical outlet and franchise profiles.' },
    { key: 'accounting', name: 'Accounting & Expenses', desc: 'Allows viewing balance ledgers, tracking corporate expenditures, and invoices.' },
    { key: 'users', name: 'User Account Controls', desc: 'Allows creating accounts, updating role titles, and blocking/unblocking logins.' },
    { key: 'rbac', name: 'Roles & RBAC Permissions', desc: 'Allows creating custom system roles and configuring permissions mapping.' },
    { key: 'settings', name: 'Settings & Style Customizer', desc: 'Allows theme switches, changing primary color palettes, and editing hero CMS text.' },
  ];

  useEffect(() => {
    if (user && user.role !== 'Super Admin') {
      router.push('/');
    } else if (user) {
      fetchRoles();
    }
  }, [user, router]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load roles list.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (key) => {
    setSelectedPermissions(prev => 
      prev.includes(key) 
        ? prev.filter(p => p !== key) 
        : [...prev, key]
    );
  };

  const handleEditRole = (role) => {
    setRoleId(role._id);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions || []);
    setEditMode(true);
    setError('');
    setMessage('');
  };

  const handleCancelEdit = () => {
    setRoleId(null);
    setRoleName('');
    setSelectedPermissions([]);
    setEditMode(false);
    setError('');
    setMessage('');
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }
    setError('');
    setMessage('');
    setSaving(true);

    const payload = {
      name: roleName.trim(),
      permissions: selectedPermissions
    };
    if (roleId) payload.id = roleId;

    try {
      const method = roleId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/roles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(roleId ? 'Role updated successfully!' : 'Role created successfully!');
        setRoleName('');
        setSelectedPermissions([]);
        setRoleId(null);
        setEditMode(false);
        fetchRoles();
      } else {
        setError(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!confirm('Are you sure you want to delete this role? Any user assigned to this role will lose their custom access rights.')) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Role deleted successfully.');
        fetchRoles();
      } else {
        setError(data.message || 'Failed to delete role');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Role & Permission Control (RBAC)</h2>
          <p className="text-neutral-500 font-medium">Create custom system roles, map permissions to sidebar links, and oversee platform access boundaries.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-100 shadow-sm">Loading roles data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Roles List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Custom Role Profiles</span>
              </h5>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Role Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Permitted Links Count</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {roles.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-neutral-500">No custom roles created. Platform defaults (Super Admin, Admin, Accountant, Store Manager) apply.</td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role._id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-neutral-900">{role.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 border border-neutral-200">
                              {role.permissions?.length || 0} permissions
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                            <button 
                              onClick={() => handleEditRole(role)}
                              className="btn btn-sm btn-outline-primary py-1 px-3.5 rounded-pill text-xs font-bold d-inline-flex align-items-center gap-1.5"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRole(role._id)}
                              className="btn btn-sm btn-outline-danger py-1 px-3.5 rounded-pill text-xs font-bold d-inline-flex align-items-center gap-1.5"
                            >
                              <Trash2 size={12} /> Delete
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

          {/* Create / Edit Form */}
          <div className="space-y-6">
            <form onSubmit={handleSaveRole} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
              <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4 d-flex align-items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>{editMode ? 'Edit Role Details' : 'Create Custom Role'}</span>
              </h5>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold">Role Name</label>
                <input 
                  type="text" 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)} 
                  placeholder="e.g. Sales Representative"
                  className="form-control rounded-xl p-3 bg-neutral-50 border-0 text-sm"
                  required
                />
              </div>

              <div>
                <label className="form-label text-neutral-700 small fw-semibold d-block mb-3">Map Permissions (Menu Access)</label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {allAvailablePermissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    return (
                      <div 
                        key={perm.key} 
                        onClick={() => handlePermissionToggle(perm.key)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'border-primary/45 bg-primary/5 text-neutral-900' 
                            : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100/50 text-neutral-600'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-0.5 leading-tight">{perm.name}</p>
                          <small className="text-neutral-500 text-xs block leading-normal">{perm.desc}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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
                  <span>{saving ? 'Saving...' : editMode ? 'Save Changes' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
