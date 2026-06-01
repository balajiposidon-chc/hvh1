import Link from 'next/link';
import { LogIn, ShoppingCart } from 'lucide-react';
export default function SiteHeader() {
    return (<header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-slate-900 text-decoration-none">
          <img src="/logo.jpg" alt="Hill & Valley" className="rounded-full object-cover" style={{ height: '35px', width: '35px' }} />
          <span className="text-cherry" style={{ fontFamily: "'Playfair Display', serif" }}>Hill & Valley</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/products" className="hover:text-brand-600">Products</Link>
          <Link href="/cart" className="hover:text-brand-600 flex items-center gap-1"><ShoppingCart size={16}/> Cart</Link>
          <Link href="/login" className="hover:text-brand-600 flex items-center gap-1"><LogIn size={16}/> Login</Link>
        </nav>
      </div>
    </header>);
}
