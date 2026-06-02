import Link from 'next/link';

export default function Footer() {
    return (
      <footer className="text-white py-5 mt-auto" style={{ background: 'var(--stone-dark)', borderTop: '2px solid var(--gold-accent)' }}>
        <div className="container px-4 px-lg-5 py-4">
          <div className="row g-5">
            {/* Column 1: Brand */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-3 mb-3">
                <img 
                  src="/logo.jpg" 
                  alt="Hill & Valley" 
                  className="rounded-circle object-cover border" 
                  style={{ height: '48px', width: '48px', borderColor: 'var(--gold-accent)' }} 
                />
                <span className="text-cherry fw-bold fs-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Hill & Valley
                </span>
              </div>
              <p className="text-whiteS small mb-0" style={{ lineHeight: '1.7', maxWidth: '300px' }}>
                Cultivating absolute purity through direct farmer-cooperative partnerships. Premium spices, gourmet cold-pressed oils, and certified organic foods delivered to your doorstep.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="col-lg-2 col-md-6">
              <h6 className="text-gold fw-bold text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Quick Navigation</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li>
                  <Link href="/" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Home Storefront
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Shop Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Customer Account
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Partner Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Top Categories */}
            <div className="col-lg-2 col-md-6">
              <h6 className="text-gold fw-bold text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Our Collections</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                <li>
                  <Link href="/products?category=Spices" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Whole & Powdered Spices
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Coconut+Oil" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Gourmet Cold Pressed Oils
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Coconut+Powder" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Organic Desiccated Coconut
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-white text-decoration-none hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                    Dry Fruits & Herbs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="col-lg-4 col-md-6">
              <h6 className="text-gold fw-bold text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Join the Newsletter</h6>
              <p className="text-white small mb-3">Subscribe to get seasonal organic harvest releases and culinary recipe tips.</p>
              <div className="d-flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  className="form-control form-control-sm text-white bg-dark border-0 rounded-pill px-3 py-2"
                  style={{ outline: 'none', background: '#2D2825 !important', fontSize: '0.85rem' }} 
                />
                <button className="btn btn-sm btn-cherry rounded-pill px-4">
                  Join
                </button>
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          {/* Copyright Bottom row */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 text-white small">
            <p className="mb-0">&copy; {new Date().getFullYear()} Hill & Valley. All rights reserved.</p>
            <p className="mb-0">
              Crafted elegantly using Next.js &middot; Bootstrap &middot; Animate.css
            </p>
          </div>
        </div>
      </footer>
    );
}
