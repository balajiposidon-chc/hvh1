"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="admin-panel-fixed flex flex-col md:flex-row min-h-screen bg-neutral-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Header Bar */}
      <div className="md:hidden w-full bg-neutral-900 text-white flex items-center justify-between p-4 sticky top-0 z-30 shadow-md">
        <button 
          className="text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors border-0 bg-transparent" 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Hill & Valley</span>
        <div className="w-10"></div> {/* Horizontal spacer to balance layout */}
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden shadow-2xl bg-neutral-900"
            >
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-8 w-full overflow-hidden max-w-[100vw]">
        {children}
      </main>
    </div>
  );
}
