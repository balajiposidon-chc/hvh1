"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, IndianRupee, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AccountingManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ summary: {}, expenses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'Super Admin' && user.role !== 'Accountant') {
      router.push('/');
    } else if (user) {
      fetchAccountingData();
    }
  }, [user, router]);

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

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Accounting & Finance</h2>
          <p className="text-neutral-500 font-medium">Manage revenue, expenses, and financial reports</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors">
            <FileText className="w-4 h-4" /> Reports
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">
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
          <div className="p-0 overflow-y-auto flex-1 max-h-[300px]">
            {loading ? (
              <p className="p-6 text-center text-neutral-500">Loading expenses...</p>
            ) : data.expenses.length === 0 ? (
              <p className="p-6 text-center text-neutral-500">No recent expenses found.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {data.expenses.map(expense => (
                  <li key={expense._id} className="p-4 flex justify-between items-center hover:bg-neutral-50/50 transition-colors">
                    <div>
                      <p className="font-bold text-neutral-900">{expense.title}</p>
                      <p className="text-xs text-neutral-500">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-red-500">-₹{expense.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
