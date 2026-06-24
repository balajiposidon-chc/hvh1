import Link from 'next/link';
import Footer from '@/components/Footer';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { Search, SlidersHorizontal } from 'lucide-react';

export default async function ProductsPage({ searchParams }) {
    await connectToDatabase();
    
    // Fetch all categories from the Category collection
    const categories = await Category.find({}).lean();
    
    const query = { status: { $in: ['active', 'Active'] } };
    const activeCategoryName = searchParams.category || '';

    if (activeCategoryName) {
        const cat = await Category.findOne({ name: activeCategoryName });
        if (cat) {
            query.category = cat._id;
        }
    }
    
    if (searchParams.q) {
        query.name = { $regex: searchParams.q, $options: 'i' };
    }

    const rawProducts = await Product.find(query).populate('category').limit(40).lean();
    const serializedProducts = JSON.parse(JSON.stringify(rawProducts));
    const products = serializedProducts.map(p => ({
        ...p,
        category: p.category ? p.category.name : 'Spice',
        categoryName: p.category ? p.category.name : 'Spice',
    }));

    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        
        <main className="container px-4 px-lg-5 py-5 flex-grow-1">
          {/* Header section */}
          <div className="mb-5 py-4 animate__animated animate__fadeIn">
            <div className="row align-items-center g-4">
              <div className="col-lg-6 text-center text-lg-start">
                <span className="text-uppercase tracking-wider fw-bold text-cherry fs-7 mb-1 d-block" style={{ letterSpacing: '2px' }}>
                  Hill & Valley Pantry
                </span>
                <h1 className="display-5 fw-bold m-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Browse our Collections
                </h1>
                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.95rem' }}>
                  Select from our organically cultivated regional spices, culinary essentials, and holistic wellness herbs.
                </p>
              </div>
              <div className="col-lg-6">
                <form action="/products" className="d-flex align-items-center gap-2 bg-white p-2 rounded-pill shadow-sm border border-light">
                  <div className="d-flex align-items-center flex-grow-1 ps-3">
                    <Search size={18} className="text-muted me-2" />
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={searchParams.q ?? ''} 
                      placeholder="Search for cardamoms, oils, herbs..." 
                      className="w-100 border-0 bg-transparent"
                      style={{ outline: 'none', border: 'none', fontSize: '0.9rem' }}
                    />
                  </div>
                  {activeCategoryName && <input type="hidden" name="category" value={activeCategoryName} />}
                  <button type="submit" className="btn btn-cherry py-2.5 px-4 rounded-pill">
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Sidebar Filters */}
            <div className="col-lg-3 animate__animated animate__fadeInLeft">
              <div className="bg-white p-4 rounded-4 shadow-sm border border-light position-sticky" style={{ top: '90px' }}>
                <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-light">
                  <SlidersHorizontal size={18} className="text-cherry" />
                  <h5 className="fw-bold mb-0 text-dark" style={{ fontFamily: "'Playfair Display', serif" }}>Filter Catalog</h5>
                </div>

                <div className="mb-4">
                  <p className="fw-semibold text-dark small mb-3">Filter by Category</p>
                  <div className="d-flex flex-column gap-2">
                    <Link 
                      href="/products" 
                      className={`text-decoration-none px-3 py-2 rounded-pill text-start small fw-medium transition-all ${
                        !activeCategoryName 
                          ? 'bg-cherry-gradient text-white shadow-sm' 
                          : 'text-muted bg-light hover-bg-cherry-light hover-text-cherry'
                      }`}
                      style={{ transition: 'all 0.3s' }}
                    >
                      All Collections
                    </Link>
                    {categories.map((cat) => (
                      <Link 
                        key={cat._id.toString()} 
                        href={`/products?category=${encodeURIComponent(cat.name)}${searchParams.q ? `&q=${searchParams.q}` : ''}`} 
                        className={`text-decoration-none px-3 py-2 rounded-pill text-start small fw-medium transition-all ${
                          activeCategoryName === cat.name 
                            ? 'bg-cherry-gradient text-white shadow-sm' 
                            : 'text-muted bg-light hover-bg-cherry-light hover-text-cherry'
                        }`}
                        style={{ transition: 'all 0.3s' }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {searchParams.q && (
                  <div className="mt-3">
                    <Link href="/products" className="btn btn-sm btn-outline-secondary w-100 rounded-pill">
                      Clear Search Query
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="col-lg-9">
              {products.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
                  <span className="fs-1 d-block mb-3">🔍</span>
                  <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No Products Found</h3>
                  <p className="text-muted small">We couldn't find matches matching your selection. Try a different query or category.</p>
                  <Link href="/products" className="btn btn-cherry mt-3 rounded-pill">
                    Clear Filters
                  </Link>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-2 g-4 animate__animated animate__fadeInUp">
                  {products.map((product) => (
                    <div key={product._id} className="col">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
}
