import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export default async function HomePage() {
    await connectToDatabase();
    // Query both lowercase and uppercase to support both seed states
    const products = await Product.find({ status: { $in: ['active', 'Active'] } }).limit(6).lean();

    return (
      <div>
        <SiteHeader />
        
        {/* Hero Section */}
        <section className="position-relative overflow-hidden py-5 bg-cherry-light" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container px-4 px-md-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 col-12 text-center text-lg-start animate__animated animate__fadeInLeft">
                <span className="text-uppercase tracking-wider fw-bold text-cherry fs-6 mb-2 d-block">Premium Spices & Organic Food</span>
                <h1 className="display-4 fw-extrabold text-dark mb-4" style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                  Sourced from Nature, <br />
                  <span className="text-cherry">Perfected by Tradition</span>
                </h1>
                <p className="lead text-muted mb-5" style={{ fontSize: '1.1rem' }}>
                  Discover Hill & Valley's premium collection of hand-picked regional spices, organic cold-pressed oils, and natural herbal wellness blends. Sourced ethically directly from local estates.
                </p>
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                  <Link href="/products" className="btn btn-cherry btn-lg px-4 py-3 shadow">
                    Shop Collection
                  </Link>
                  <Link href="/admin" className="btn btn-outline-cherry btn-lg px-4 py-3">
                    Partner Workspace
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 col-12 animate__animated animate__fadeInRight">
                <div className="position-relative">
                  <div className="position-absolute bg-cherry opacity-10 rounded-circle w-75 h-75 top-50 start-50 translate-middle z-0" style={{ filter: 'blur(50px)' }}></div>
                  <img 
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                    alt="Spices Banner" 
                    className="img-fluid rounded-5 shadow-lg position-relative z-1 border border-light"
                    style={{ transform: 'rotate(-2deg)', maxHeight: '480px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-5 bg-white border-top border-bottom border-light">
          <div className="container">
            <div className="row g-4 text-center">
              <div className="col-md-4 animate__animated animate__fadeInUp">
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry fs-2 mb-3">🍃</div>
                  <h4 className="fw-bold text-dark mb-2">100% Organic & Pure</h4>
                  <p className="text-muted small mb-0">No additives, preservatives, or artificial flavorings. Guaranteed laboratory-tested purity.</p>
                </div>
              </div>
              <div className="col-md-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry fs-2 mb-3">🤝</div>
                  <h4 className="fw-bold text-dark mb-2">Direct Ethical Sourcing</h4>
                  <p className="text-muted small mb-0">We work directly with regional estate farmers, ensuring fair trade and supporting agricultural growth.</p>
                </div>
              </div>
              <div className="col-md-4 animate__animated animate__fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="p-4 glass-card h-100">
                  <div className="text-cherry fs-2 mb-3">📦</div>
                  <h4 className="fw-bold text-dark mb-2">Hygienic Secure Packaging</h4>
                  <p className="text-muted small mb-0">Packed in high-grade eco-friendly seals to retain authentic regional aromas and structural freshness.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Catalog Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <div>
                <span className="text-uppercase tracking-wider fw-bold text-cherry small d-block mb-1">Our Showcase</span>
                <h2 className="fw-extrabold text-dark m-0" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Collections</h2>
              </div>
              <Link href="/products" className="text-decoration-none text-cherry fw-bold border-bottom border-cherry pb-1">
                View All Products &rarr;
              </Link>
            </div>
            
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {products.map((product) => (
                <div key={product._id.toString()} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin/Corporate Promotion Section */}
        <section className="py-5 bg-cherry text-white overflow-hidden position-relative">
          <div className="position-absolute bg-white opacity-10 rounded-circle w-50 h-50 top-0 end-0 translate-middle z-0" style={{ filter: 'blur(100px)' }}></div>
          <div className="container position-relative z-1 py-4 text-center">
            <h2 className="display-5 fw-extrabold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enterprise ERP & Partner Management
            </h2>
            <p className="lead mx-auto mb-4 opacity-90" style={{ maxWidth: '650px', fontSize: '1.1rem' }}>
              Are you a Store Manager, Accountant, or Admin? Access our robust, role-based ERP dashboard to check stocks, track customer orders, process transactions, and manage store locations.
            </p>
            <Link href="/admin" className="btn btn-light text-cherry btn-lg px-5 py-3 rounded-pill fw-bold shadow">
              Enter Workspace &rarr;
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    );
}
