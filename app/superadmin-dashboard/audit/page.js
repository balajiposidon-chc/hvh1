"use client";

import { useEffect, useState, Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Printer, CheckCircle, AlertTriangle, 
  RotateCw, ShieldCheck, Database, ShoppingBag, 
  Users, RefreshCw, Layers 
} from 'lucide-react';

function AuditPanelContent() {
  const { user, permissions = [] } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions');

  // Client-side authentication guard
  useEffect(() => {
    if (user) {
      const isSuper = user.role === 'Super Admin' || permissions.includes('audit');
      if (!isSuper) {
        router.push('/');
      } else {
        fetchAuditData();
      }
    }
  }, [user, permissions, router]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = (scenarioId) => {
    setTestingId(scenarioId);
    // Simulate test execution delay for visual polish
    setTimeout(() => {
      setTestingId(null);
      // Re-fetch to get updated values
      fetchAuditData();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!data) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Page 1: EXECUTIVE DIAGNOSTIC SUMMARY
      drawPDFHeader(doc, "EXECUTIVE SYSTEM AUDIT SUMMARY", pageWidth);
      
      // Meta Section
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Audited By: ${user.name} (${user.role})`, 14, 45);
      doc.text(`Date of Audit: ${new Date().toLocaleString()}`, 14, 51);
      doc.text(`Target Host: Hill & Valley Enterprise Cloud`, 14, 57);
      
      // Diagnostics Scenarios Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text("1. SYSTEM INTEGRITY SCENARIO TESTS", 14, 70);
      
      let startY = 75;
      data.scenarios.forEach((sc, idx) => {
        doc.setFillColor(sc.status === 'Pass' ? 240 : 255, sc.status === 'Pass' ? 248 : 243, sc.status === 'Pass' ? 245 : 240);
        doc.rect(14, startY, pageWidth - 28, 14, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(`${idx + 1}. ${sc.name}`, 18, startY + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(sc.message, 18, startY + 11);
        
        // Status Badge
        doc.setFillColor(sc.status === 'Pass' ? 46 : 217, sc.status === 'Pass' ? 125 : 83, sc.status === 'Pass' ? 50 : 79);
        doc.rect(pageWidth - 35, startY + 4, 21, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(sc.status.toUpperCase(), pageWidth - 35 + (21 - doc.getTextWidth(sc.status.toUpperCase())) / 2, startY + 8.2);
        
        startY += 17;
      });

      // Quick Business Metrics Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text("2. CORE LEDGER METRICS SUMMARY", 14, 168);

      doc.setFillColor(248, 245, 240); // Gold Light
      doc.rect(14, 173, pageWidth - 28, 42, "F");
      
      const metrics = [
        { label: "Total Revenue", val: `INR ${data.summary.totalRevenue.toLocaleString()}` },
        { label: "Total Expenses", val: `INR ${data.summary.totalExpenses.toLocaleString()}` },
        { label: "Net Operating Profit", val: `INR ${data.summary.netProfit.toLocaleString()}` },
        { label: "Asset Valuation (Stock)", val: `INR ${data.summary.totalStockValue.toLocaleString()}` }
      ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      metrics.forEach((m, idx) => {
        const mx = idx % 2 === 0 ? 20 : 110;
        const my = idx < 2 ? 182 : 202;
        doc.setFont("helvetica", "bold");
        doc.text(m.label, mx, my);
        doc.setFont("helvetica", "normal");
        doc.text(m.val, mx, my + 6);
      });

      // Footer
      drawPDFFooter(doc, 1, pageHeight);

      // Page 2: ACCOUNTING TRANSACTIONS LEDGER
      doc.addPage();
      drawPDFHeader(doc, "ACCOUNT TRANSACTION LEDGER", pageWidth);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(33, 33, 33);
      doc.rect(14, 45, pageWidth - 28, 8, "F");
      doc.text("Transaction ID", 18, 50.5);
      doc.text("Type", 52, 50.5);
      doc.text("Description", 75, 50.5);
      doc.text("Amount (INR)", 140, 50.5);
      doc.text("Date", 170, 50.5);

      let ty = 57;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(33, 33, 33);

      data.recentTransactions.slice(0, 20).forEach((t) => {
        if (ty > pageHeight - 20) {
          doc.addPage();
          drawPDFHeader(doc, "ACCOUNT TRANSACTION LEDGER (CONT.)", pageWidth);
          ty = 45;
        }
        
        doc.text(t.id.slice(-8).toUpperCase(), 18, ty);
        
        // Type color coding
        doc.setFont("helvetica", "bold");
        doc.setTextColor(t.type === 'Revenue' ? 46 : 217, t.type === 'Revenue' ? 125 : 83, t.type === 'Revenue' ? 50 : 79);
        doc.text(t.type, 52, ty);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(t.description.length > 32 ? t.description.slice(0, 32) + '...' : t.description, 75, ty);
        doc.text(t.amount.toLocaleString(), 140, ty);
        doc.text(new Date(t.date).toLocaleDateString(), 170, ty);
        
        doc.setDrawColor(230, 230, 230);
        doc.line(14, ty + 3, pageWidth - 14, ty + 3);
        ty += 8.5;
      });
      drawPDFFooter(doc, 2, pageHeight);

      // Page 3: CATALOG DETAILS
      doc.addPage();
      drawPDFHeader(doc, "PRODUCT INVENTORY LEDGER", pageWidth);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(33, 33, 33);
      doc.rect(14, 45, pageWidth - 28, 8, "F");
      doc.text("SKU", 18, 50.5);
      doc.text("Product Name", 55, 50.5);
      doc.text("Price", 125, 50.5);
      doc.text("Stock Qty", 150, 50.5);
      doc.text("Valuation", 175, 50.5);

      let py = 57;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);

      data.products.slice(0, 22).forEach((p) => {
        if (py > pageHeight - 20) {
          doc.addPage();
          drawPDFHeader(doc, "PRODUCT INVENTORY LEDGER (CONT.)", pageWidth);
          py = 45;
        }

        doc.text(p.sku, 18, py);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text(p.name.length > 30 ? p.name.slice(0, 30) + '...' : p.name, 55, py);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`INR ${p.price}`, 125, py);
        doc.text(p.stock.toString(), 150, py);
        doc.text(`INR ${(p.price * p.stock).toLocaleString()}`, 175, py);

        doc.setDrawColor(230, 230, 230);
        doc.line(14, py + 3, pageWidth - 14, py + 3);
        py += 8.5;
      });
      drawPDFFooter(doc, 3, pageHeight);

      // Page 4: CLIENT REGISTRY
      doc.addPage();
      drawPDFHeader(doc, "ENTERPRISE CLIENT REGISTRY", pageWidth);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(33, 33, 33);
      doc.rect(14, 45, pageWidth - 28, 8, "F");
      doc.text("Client Name", 18, 50.5);
      doc.text("Email Address", 75, 50.5);
      doc.text("Status", 145, 50.5);
      doc.text("Joined Date", 170, 50.5);

      let cy = 57;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);

      data.clients.slice(0, 22).forEach((c) => {
        if (cy > pageHeight - 20) {
          doc.addPage();
          drawPDFHeader(doc, "ENTERPRISE CLIENT REGISTRY (CONT.)", pageWidth);
          cy = 45;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text(c.name, 18, cy);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(c.email, 75, cy);
        doc.text(c.status.toUpperCase(), 145, cy);
        doc.text(new Date(c.createdAt).toLocaleDateString(), 170, cy);

        doc.setDrawColor(230, 230, 230);
        doc.line(14, cy + 3, pageWidth - 14, cy + 3);
        cy += 8.5;
      });
      drawPDFFooter(doc, 4, pageHeight);

      doc.save(`hv_system_audit_${Date.now()}.pdf`);
    } catch (e) {
      console.error("Failed PDF generation", e);
    }
  };

  const drawPDFHeader = (doc, title, pageWidth) => {
    // Header Bar
    doc.setFillColor(28, 28, 28);
    doc.rect(14, 14, pageWidth - 28, 20, "F");
    
    // Gold Accent Border
    doc.setFillColor(197, 168, 128); // gold-accent
    doc.rect(14, 34, pageWidth - 28, 1.5, "F");

    doc.setFont("playfair", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, 27);
  };

  const drawPDFFooter = (doc, pageNum, pageHeight) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`CONFIDENTIAL - FOR SUPER ADMIN INTERNAL AUDIT ONLY`, 14, pageHeight - 10);
    doc.text(`Page ${pageNum}`, doc.internal.pageSize.getWidth() - 25, pageHeight - 10);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <RotateCw className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-neutral-500 font-semibold">Running comprehensive system audit checks...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Printable Area Wrapper */}
      <div className="printable-report">
        
        {/* Header Block - Hidden on Print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
          <div>
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              System Audit & Compliance Panel
            </h2>
            <p className="text-neutral-500 font-medium">Verify system health, ledger records, and run test scenarios.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition-colors bg-white"
            >
              <Printer className="w-4 h-4" /> Print Ledger
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all border-0"
            >
              <FileText className="w-4 h-4" /> Download PDF Report
            </button>
          </div>
        </div>

        {/* Diagnostic Scenarios Checklist - Hidden on Print */}
        <div className="mb-8 no-print">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h4 className="text-xl font-bold text-neutral-900 m-0">Diagnostic Scenario Tests</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.scenarios.map((sc) => (
              <div 
                key={sc.id} 
                className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-neutral-800 leading-snug">{sc.name}</h5>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      sc.status === 'Pass' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {sc.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4 leading-relaxed">{sc.description}</p>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100/50 mb-4">
                    <span className="text-xs font-medium text-neutral-600 leading-tight block">{sc.message}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRunTest(sc.id)}
                  disabled={testingId === sc.id}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all disabled:bg-neutral-200 disabled:text-neutral-400 border-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === sc.id ? 'animate-spin' : ''}`} />
                  <span>{testingId === sc.id ? 'Running Test...' : 'Execute Scenario'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 no-print">
            <Layers className="w-5 h-5 text-primary" />
            <h4 className="text-xl font-bold text-neutral-900 m-0">Operating Ledger Summary</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Gross Revenue', value: `₹${data?.summary.totalRevenue.toLocaleString()}`, color: 'text-emerald-600' },
              { title: 'Total Expenses', value: `₹${data?.summary.totalExpenses.toLocaleString()}`, color: 'text-rose-600' },
              { title: 'Net Profit', value: `₹${data?.summary.netProfit.toLocaleString()}`, color: 'text-primary' },
              { title: 'Asset Stock Valuation', value: `₹${data?.summary.totalStockValue.toLocaleString()}`, color: 'text-amber-600' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 print-border">
                <p className="text-neutral-500 font-semibold mb-1 text-sm">{stat.title}</p>
                <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
                <span className="text-xs text-neutral-400 block mt-2">Historical Ledger Value</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Preview Table - Print Friendly */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden print-border mb-8">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4 no-print">
            <h4 className="text-xl font-bold text-neutral-900 m-0">Detailed System Registries</h4>
            <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-xl w-full sm:w-auto">
              {[
                { id: 'transactions', label: 'Transactions' },
                { id: 'products', label: 'Products' },
                { id: 'clients', label: 'Clients' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 ${
                    activeTab === tab.id 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-800 bg-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Preview */}
          <div className="overflow-x-auto">
            {activeTab === 'transactions' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {data?.recentTransactions.slice(0, 15).map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">#{t.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          t.type === 'Revenue' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-800">{t.description}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900">₹{t.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-neutral-500">{new Date(t.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'products' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Stock Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {data?.products.slice(0, 15).map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-neutral-500">{p.sku}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900">{p.name}</td>
                      <td className="px-6 py-4 font-medium text-neutral-700">₹{p.price}</td>
                      <td className="px-6 py-4 font-medium text-neutral-700">{p.stock}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900">₹{(p.price * p.stock).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'clients' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {data?.clients.slice(0, 15).map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-neutral-900">{c.name}</td>
                      <td className="px-6 py-4 font-medium text-neutral-600">{c.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default function AuditPanel() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-neutral-500 font-bold text-lg animate-pulse">Loading Audit Diagnostics...</p>
      </div>
    }>
      <AuditPanelContent />
    </Suspense>
  );
}
