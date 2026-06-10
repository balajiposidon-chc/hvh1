"use client";

import { useEffect, useState, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, IndianRupee, TrendingUp, TrendingDown, Edit2, Trash2, X, Info, Store } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StoreAccountingManagementContent() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeIdParam = searchParams.get('storeId');
  
  // Data state
  const [data, setData] = useState({ summary: {}, expenses: [] });
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Error/Success feedback
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
      if (!isSuperAdmin && !permissions.includes('store-panel')) {
        router.push('/unauthorized');
      } else {
        fetchStoreInfo();
        fetchAccountingData();
      }
    }
  }, [user, permissions, router, storeIdParam]);

  const fetchStoreInfo = async () => {
    try {
      const url = storeIdParam ? `/api/store-panel/stats?storeId=${storeIdParam}` : '/api/store-panel/stats';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setStoreInfo(result.store);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAccountingData = async () => {
    try {
      setLoading(true);
      const url = storeIdParam ? `/api/accounting?storeId=${storeIdParam}` : '/api/accounting';
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setData({
          summary: result.summary,
          expenses: result.recentExpenses || []
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setAmount('');
    setCategory('Rent');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setExpenseToEdit(expense);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setNotes(expense.notes || '');
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setFormError('Please enter a valid title and positive amount.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          date,
          notes: notes.trim(),
          storeId: storeIdParam || undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        setFormSuccess('Expense recorded successfully!');
        fetchAccountingData();
        setTimeout(() => setIsAddModalOpen(false), 800);
      } else {
        setFormError(result.message || 'Failed to record expense.');
      }
    } catch (error) {
      setFormError('Error connecting to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setFormError('Please enter a valid title and positive amount.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/accounting/${expenseToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          date,
          notes: notes.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        setFormSuccess('Expense updated successfully!');
        fetchAccountingData();
        setTimeout(() => setIsEditModalOpen(false), 800);
      } else {
        setFormError(result.message || 'Failed to update expense.');
      }
    } catch (error) {
      setFormError('Error connecting to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/accounting/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        fetchAccountingData();
      } else {
        alert(result.message || 'Failed to delete expense.');
      }
    } catch (error) {
      alert('Error connecting to the server.');
    }
  };

  const chartData = [
    { name: 'Jan', revenue: 20000, expense: 12000 },
    { name: 'Feb', revenue: 15000, expense: 8000 },
    { name: 'Mar', revenue: 10000, expense: 19000 },
    { name: 'Apr', revenue: 13900, expense: 9540 },
    { name: 'May', revenue: Math.round(data.summary.totalRevenue || 0), expense: Math.round(data.summary.totalExpenses || 0) },
  ];

  const isSuperAdmin = user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'superadmin';
  if (!user || (!permissions.includes('store-panel') && !isSuperAdmin)) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-extrabold text-neutral-900 m-0">{storeInfo?.name || 'Store'} accounts</h2>
          </div>
          <p className="text-neutral-500 font-medium">Manage outlet revenue, store expenditures, and financial ledgers</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all w-full md:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Outlet Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Store Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(data.summary.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Store Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(data.summary.totalExpenses || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><IndianRupee className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Outlet Net Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${(data.summary.netProfit || 0) >= 0 ? 'text-primary' : 'text-red-500'}`}>
            ₹{(data.summary.netProfit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 lg:col-span-3">
          <h5 className="text-xl font-bold text-neutral-900 mb-6">Cash Flow Overview</h5>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#4f6f52" radius={[4, 4, 0, 0]} name="Store Revenue" />
                <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} name="Store Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mb-12">
        <div className="p-6 border-b border-neutral-100">
          <h5 className="text-xl font-bold text-neutral-900 mb-0">Expense Ledger</h5>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-12 text-center text-neutral-500">Loading ledger data...</p>
          ) : data.expenses.length === 0 ? (
            <p className="p-12 text-center text-neutral-500">No expenses recorded for this store.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Expense Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-neutral-900 mb-0">{expense.title}</p>
                        {expense.notes && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> {expense.notes}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-medium">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-red-500">
                      -₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleOpenEditModal(expense)}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-lg hover:bg-neutral-100 mr-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold text-neutral-900 mb-6">Add Store Expense</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Utility Bills"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-700 font-bold mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 font-bold mb-2">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {['Salaries', 'Rent', 'Utilities', 'Marketing', 'Logistics', 'Raw Materials', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Add details..."
                  rows={3}
                />
              </div>

              {formError && <p className="text-sm text-red-500 font-semibold">{formError}</p>}
              {formSuccess && <p className="text-sm text-emerald-600 font-semibold">{formSuccess}</p>}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all mt-4 disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Record Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold text-neutral-900 mb-6">Edit Store Expense</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-700 font-bold mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 font-bold mb-2">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {['Salaries', 'Rent', 'Utilities', 'Marketing', 'Logistics', 'Raw Materials', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 font-bold mb-2">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                />
              </div>

              {formError && <p className="text-sm text-red-500 font-semibold">{formError}</p>}
              {formSuccess && <p className="text-sm text-emerald-600 font-semibold">{formSuccess}</p>}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all mt-4 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function StoreAccountingManagement() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Ledger Summary...</p>
      </div>
    }>
      <StoreAccountingManagementContent />
    </Suspense>
  );
}
