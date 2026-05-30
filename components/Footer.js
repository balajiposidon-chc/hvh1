import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-2xl font-bold mb-6 text-accent">Hill & Valley</h4>
            <p className="text-neutral-400 leading-relaxed">
              Premium regional spices and coconut products sourced directly from the finest farms in South India. Experience authentic taste and purity.
            </p>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-6 text-white">Quick Links</h5>
            <ul className="space-y-4">
              <li><Link href="/" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Home</Link></li>
              <li><Link href="/products" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Shop</Link></li>
              <li><Link href="/about" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">About Us</Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-6 text-white">Categories</h5>
            <ul className="space-y-4">
              <li><Link href="/products?category=Spices" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Spices</Link></li>
              <li><Link href="/products?category=Coconut" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Coconut Products</Link></li>
              <li><Link href="/products?category=Herbal" className="text-neutral-400 hover:text-accent hover:translate-x-1 inline-block transition-all duration-300">Herbal Extracts</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-6 text-white">Contact Us</h5>
            <ul className="space-y-4 text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>123 Spice Road, Madurai</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>info@hillandvalley.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Hill & Valley. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
