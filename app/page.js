export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Setting from '@/lib/models/Setting';
import { ShieldCheck, Leaf, Truck, ArrowRight, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function HomePage({ searchParams }) {
    await connectToDatabase();
    
    const totalProducts = await Product.countDocuments({ status: { $in: ['active', 'Active'] } });
    const limit = 9;
    const totalPages = Math.ceil(totalProducts / limit);
    
    let page = parseInt(searchParams?.page) || 1;
    if (page < 1) page = 1;
    if (totalPages > 0 && page > totalPages) page = totalPages;

    const skip = (page - 1) * limit;
    const rawProducts = await Product.find({ status: { $in: ['active', 'Active'] } })
        .skip(skip)
        .limit(limit)
        .lean();
        
    const serializedProducts = JSON.parse(JSON.stringify(rawProducts));
    const products = serializedProducts.map(p => ({
        ...p,
        category: p.category ? p.category.toString() : '',
    }));

    const setting = await Setting.findOne().lean() || {};

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        {/* Hero Section */}
        <section className="position-relative overflow-hidden py-5 d-flex align-items-center" style={{ minHeight: '85vh', background: 'radial-gradient(circle at 80% 20%, rgba(210, 20, 58, 0.06) 0%, rgba(197, 168, 128, 0.03) 50%, var(--gold-light) 100%)' }}>
          {/* Blurred Glow Spheres */}
          <div className="position-absolute bg-cherry opacity-10 rounded-circle float-slow" style={{ width: '400px', height: '400px', top: '-10%', right: '-5%', filter: 'blur(120px)', zIndex: 0 }}></div>
          <div className="position-absolute bg-warning opacity-10 rounded-circle float-slow" style={{ width: '350px', height: '350px', bottom: '10%', left: '-5%', filter: 'blur(100px)', zIndex: 0, animationDelay: '-3s' }}></div>
 
          <div className="container px-4 px-md-5 position-relative z-1">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 col-12 text-center text-lg-start animate__animated animate__fadeInLeft">
                <span className="text-uppercase tracking-wider fw-bold text-cherry fs-6 mb-3 d-inline-block px-3 py-1.5 rounded-pill" style={{ background: 'var(--cherry-light)', fontSize: '0.8rem', letterSpacing: '1.5px' }}>
                 Pure, Ethical & Authentic Spices
                </span>
                <h1 className="display-3 fw-bold hero-title mb-4" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.15 }}>
                  {setting.heroTitle || 'Sourced from Nature, Perfected by Tradition'}
                </h1>
                <p className="lead hero-subtitle mb-5" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
                  {setting.heroSubtitle || "Discover Hill & Valley's premium collection of hand-picked regional spices, organic cold-pressed oils, and wellness blends. Ethically sourced directly from local estate farmers to preserve original rich aromas."}
                </p>
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                  <Link href={setting.heroBtnLink || "/products"} className="btn btn-outline-cherry btn-lg px-4 py-3">
                    {setting.heroBtnText || "Explore Collection"}
                  </Link>
                  <Link href="/admin" className="btn btn-outline-cherry btn-lg px-4 py-3">
                    Partner Workspace
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 col-12 animate__animated animate__fadeInRight text-center">
                <div className="position-relative d-inline-block">
                  {/* Decorative golden ring */}
                  <div className="position-absolute border border-warning rounded-5" style={{ width: '100%', height: '100%', top: '15px', left: '15px', zIndex: 0, borderStyle: 'dashed !important', opacity: 0.3, borderColor: 'var(--gold-accent)' }}></div>
                  <img 
                    src={setting.heroImage || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
                    alt="Spices Banner" 
                    className="img-fluid rounded-5 shadow-lg position-relative z-1"
                    style={{ transform: 'rotate(-1.5deg)', maxHeight: '490px', width: '100%', maxWidth: '540px', objectFit: 'cover' }}
                  />
                  {/* Floating Info card */}
                  <div className="position-absolute bg-white p-3 rounded-4 shadow-sm z-2 d-none d-sm-flex align-items-center gap-3 border border-light animate__animated animate__bounceIn" style={{ bottom: '20px', left: '-30px', animationDelay: '1s' }}>
                    <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <Leaf size={20} />
                    </div>
                    <div className="text-start">
                      <h6 className="fw-bold text-dark mb-0">100% Certified Organic</h6>
                      <small className="text-muted">Zero artificial additives</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-5 bg-white border-top border-bottom border-light position-relative z-1">
          <div className="container">
            <div className="row g-4 text-center">
              <div className="col-md-4 animate__animated animate__fadeInUp">
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry mb-4 d-inline-flex p-3 rounded-circle bg-cherry-light">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Laboratory Tested</h4>
                  <p className="text-muted small mb-0 px-2" style={{ lineHeight: '1.6' }}>Every batch undergoes rigorous quality testing to ensure complete purity and absence of adulterants.</p>
                </div>
              </div>
              <div className="col-md-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry mb-4 d-inline-flex p-3 rounded-circle bg-cherry-light">
                    <Globe size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Direct Farm Sourcing</h4>
                  <p className="text-muted small mb-0 px-2" style={{ lineHeight: '1.6' }}>We work hand-in-hand with farm cooperatives, giving back to rural growers and maintaining fair price transparency.</p>
                </div>
              </div>
              <div className="col-md-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry mb-4 d-inline-flex p-3 rounded-circle bg-cherry-light">
                    <Truck size={32} />
                  </div>
                  <h4 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Fresh Lock Packing</h4>
                  <p className="text-muted small mb-0 px-2" style={{ lineHeight: '1.6' }}>Aroma-tight eco packaging maintains natural essential oils and retains authentic freshness.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Catalog Section */}
        <section className="py-5 bg-gold-light">
          <div className="container py-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end mb-5 gap-3">
              <div>
                <span className="text-uppercase tracking-wider fw-bold text-cherry small d-block mb-1" style={{ letterSpacing: '2px' }}>Our Showcase</span>
                <h2 className="fw-bold m-0 display-5" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Collections</h2>
              </div>
              <Link href="/products" className="text-decoration-none text-cherry fw-semibold border-bottom border-cherry pb-1 d-inline-flex align-items-center gap-1">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {products.map((product) => (
                <div key={product._id.toString()} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5 animate__animated animate__fadeIn">
                <nav aria-label="Product pagination">
                  <ul className="pagination pagination-md justify-content-center gap-2 border-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <Link
                        href={`/?page=${page - 1}`}
                        className="page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: 'var(--dynamic-card, #fff)',
                          color: page === 1 ? 'var(--dynamic-text-muted, #ccc)' : 'var(--dynamic-primary, #D2143A)',
                          transition: 'all 0.3s',
                          pointerEvents: page === 1 ? 'none' : 'auto'
                        }}
                      >
                        <ChevronLeft size={18} />
                      </Link>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const p = index + 1;
                      const isActive = p === page;
                      return (
                        <li key={p} className={`page-item ${isActive ? 'active' : ''}`}>
                          <Link
                            href={`/?page=${p}`}
                            className="page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center fw-semibold"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: isActive ? 'var(--dynamic-primary, #D2143A)' : 'var(--dynamic-card, #fff)',
                              color: isActive ? '#fff' : 'var(--dynamic-font, #1A1A1A)',
                              transition: 'all 0.3s'
                            }}
                          >
                            {p}
                          </Link>
                        </li>
                      );
                    })}

                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <Link
                        href={`/?page=${page + 1}`}
                        className="page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: 'var(--dynamic-card, #fff)',
                          color: page === totalPages ? 'var(--dynamic-text-muted, #ccc)' : 'var(--dynamic-primary, #D2143A)',
                          transition: 'all 0.3s',
                          pointerEvents: page === totalPages ? 'none' : 'auto'
                        }}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </section>

        {/* Brand Story / Showcase section */}
        <section className="py-5 bg-white overflow-hidden">
          <div className="container py-4">
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <img 
                  src="https://images.unsplash.com/photo-1532336414038-cf19250c5757?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Harvesting Spices" 
                  className="img-fluid rounded-4 shadow hover-zoom" 
                  style={{ objectFit: 'cover', height: '380px', width: '100%' }}
                />
              </div>
              <div className="col-lg-7">
                <span className="text-gold fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Our Legacy</span>
                <h2 className="fw-bold text-dark mt-2 mb-4 display-6" style={{ fontFamily: "'Playfair Display', serif" }}>Rooted in Purity, Honored by Families</h2>
                <p className="text-muted mb-4" style={{ lineHeight: '1.7' }}>
                  Hill & Valley is born out of a passion to reconnect families with true, unadulterated spices. We believe that food is medicine, and the quality of what you consume determines your vitality. By eliminating intermediaries and sourcing directly from rain-shadow hills and fertile valley plantations, we bring you spices in their most potent form.
                </p>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="border-start border-cherry border-3 ps-3">
                      <h4 className="fw-bold text-cherry mb-0">15+</h4>
                      <small className="text-muted">Estate Farms Partners</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border-start border-cherry border-3 ps-3">
                      <h4 className="fw-bold text-cherry mb-0">100%</h4>
                      <small className="text-muted">Organic Sourcing</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate ERP Banner */}
        <section className="py-5 bg-cherry-gradient text-white position-relative overflow-hidden">
          {/* Subtle circles */}
          <div className="position-absolute bg-white opacity-5 rounded-circle" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
          <div className="container position-relative z-1 py-5 text-center">
            <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enterprise ERP & Partner Management
            </h2>
            <p className="lead mx-auto mb-4 opacity-75" style={{ maxWidth: '700px', fontSize: '1.1rem', lineHeight: '1.7' }}>
              Access our integrated dashboard for store managers, administrative partners, and accountants. Oversee catalog controls, inventory states, invoices, and sales performance seamlessly.
            </p>
            <div className="d-flex justify-content-center">
              <Link href="/admin" className="btn btn-gold btn-lg px-5 py-3 rounded-pill fw-bold text-white">
                Enter Workspace &rarr;
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
}
