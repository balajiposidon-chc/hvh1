"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, IndianRupee, TrendingUp, TrendingDown, FileText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AccountingManagement() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ summary: {}, expenses: [] });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stores, setStores] = useState([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const isSuperAdmin = user.role?.toLowerCase() === 'super admin' || user.role?.toLowerCase() === 'superadmin';
      if (!isSuperAdmin && !permissions.includes('accounting')) {
        router.push('/');
      } else {
        fetchAccountingData();
        fetchStores();
      }
    }
  }, [user, permissions, router]);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const result = await res.json();
      if (result.success) {
        setStores(result.stores || []);
      }
    } catch (e) {
      console.error("Failed to load stores for accounting", e);
    }
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setAmount('');
    setCategory('Rent');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSelectedStoreId('');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setFormError('Please enter a valid title and positive amount.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
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
          storeId: selectedStoreId || undefined
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

  const fetchAccountingData = async () => {
    try {
      const res = await fetch('/api/accounting');
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

  const chartData = [
    { name: 'Jan', revenue: 4000, expense: 2400 },
    { name: 'Feb', revenue: 3000, expense: 1398 },
    { name: 'Mar', revenue: 2000, expense: 3800 },
    { name: 'Apr', revenue: 2780, expense: 1908 },
    { name: 'May', revenue: Math.round((data.summary.totalRevenue || 0) / 10), expense: Math.round((data.summary.totalExpenses || 0) / 10) },
  ];

  const groupedExpenses = (data.expenses || []).reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = {
        expenses: [],
        subtotal: 0
      };
    }
    acc[category].expenses.push(expense);
    acc[category].subtotal += expense.amount || 0;
    return acc;
  }, {});

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Accounting & Finance</h2>
          <p className="text-neutral-500 font-medium">Manage revenue, expenses, and financial reports</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push('/superadmin-dashboard/audit')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors"
          >
            <FileText className="w-4 h-4" /> Reports
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(data.summary.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Total Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(data.summary.totalExpenses || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><IndianRupee className="w-5 h-5" /></div>
            <h3 className="text-neutral-500 font-semibold">Net Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${(data.summary.netProfit || 0) >= 0 ? 'text-primary' : 'text-red-500'}`}>
            ₹{(data.summary.netProfit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h5 className="text-xl font-bold text-neutral-900 mb-6">Cash Flow Overview</h5>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3' }} dx={-10} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#4f6f52" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-full">
          <div className="p-6 border-b border-neutral-100">
            <h5 className="text-xl font-bold text-neutral-900 mb-0">Recent Expenses</h5>
          </div>
          <div className="p-4 overflow-y-auto flex-1 max-h-[300px]">
            {loading ? (
              <p className="p-2 text-center text-neutral-500">Loading expenses...</p>
            ) : data.expenses.length === 0 ? (
              <p className="p-2 text-center text-neutral-500">No recent expenses found.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedExpenses).map(([category, group]) => (
                  <div key={category} className="border border-neutral-100 rounded-xl overflow-hidden bg-neutral-50/50">
                    <div className="px-4 py-2.5 bg-neutral-100/70 border-b border-neutral-100 flex justify-between items-center">
                      <span className="font-bold text-xs uppercase tracking-wider text-neutral-600">{category}</span>
                      <span className="font-bold text-xs text-red-600">Subtotal: -₹{group.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <ul className="divide-y divide-neutral-100 bg-white mb-0 pl-0">
                      {group.expenses.map(expense => (
                        <li key={expense._id} className="px-4 py-3 flex justify-between items-center hover:bg-neutral-50/20 transition-colors">
                          <div>
                            <p className="font-bold text-neutral-900 text-sm mb-0.5">{expense.title}</p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                          </div>
                          <span className="font-bold text-red-500 text-sm">-₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-extrabold text-neutral-900 mb-6">Record Expense</h3>
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
                <label className="block text-sm text-neutral-700 font-bold mb-2">Assign to Store (Optional)</label>
                <select 
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">None (Global / Enterprise)</option>
                  {stores.map(store => (
                    <option key={store._id} value={store._id}>{store.name} ({store.location})</option>
                  ))}
                </select>
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
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all mt-4 disabled:opacity-50 border-0 cursor-pointer"
              >
                {submitting ? 'Recording...' : 'Record Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
