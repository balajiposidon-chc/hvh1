"use client";
import { useState } from 'react';
export default function AdminUserTable({ users: initialUsers, mainAdminEmail }) {
    const [users, setUsers] = useState(initialUsers);
    const [error, setError] = useState('');
    const updateUser = async (id, payload) => {
        setError('');
        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            setError(data.message || 'Unable to update user');
            return;
        }
        setUsers((current) => current.map((user) => user.id === id ? { ...user, ...payload } : user));
    };
    const removeUser = async (id, email) => {
        if (email === mainAdminEmail) {
            setError('Main admin cannot be deleted.');
            return;
        }
        const confirmed = confirm('Delete this user account?');
        if (!confirmed)
            return;
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) {
            setError(data.message || 'Unable to delete user');
            return;
        }
        setUsers((current) => current.filter((user) => user.id !== id));
    };
    return (<div className="space-y-4">
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-600">Name</th>
              <th className="px-6 py-4 font-medium text-slate-600">Email</th>
              <th className="px-6 py-4 font-medium text-slate-600">Role</th>
              <th className="px-6 py-4 font-medium text-slate-600">Status</th>
              <th className="px-6 py-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (<tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-900">{user.email}</td>
                <td className="px-6 py-4 text-slate-900">{user.role}</td>
                <td className="px-6 py-4 text-slate-900">{user.status}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => updateUser(user.id, { role: user.role === 'manager' ? 'customer' : 'manager' })} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">{user.role === 'manager' ? 'Demote' : 'Promote'}</button>
                  <button onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'blocked' : 'active' })} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">{user.status === 'active' ? 'Block' : 'Unblock'}</button>
                  <button onClick={() => removeUser(user.id, user.email)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200">Delete</button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
