"use client";

import { Download, Printer } from 'lucide-react';

export default function OrderActions({ order }) {
  const handleDownload = async () => {
    try {
      const { downloadInvoicePDF } = await import('@/utils/invoice');
      await downloadInvoicePDF(order);
    } catch (err) {
      console.error(err);
      alert("Failed to download invoice");
    }
  };

  const handlePrint = async () => {
    try {
      const { printInvoiceHTML } = await import('@/utils/invoice');
      printInvoiceHTML(order);
    } catch (err) {
      console.error(err);
      alert("Failed to print invoice");
    }
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-4 flex gap-4 items-center">
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100/60 px-3.5 py-2 rounded-xl"
      >
        <Download className="w-4 h-4" /> Download PDF
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl"
      >
        <Printer className="w-4 h-4" /> Print Bill
      </button>
    </div>
  );
}
