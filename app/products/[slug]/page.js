'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Leaf, Truck, Check, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    const updateCurrency = () => {
      setCurrency(localStorage.getItem('hill-currency') || 'INR');
    };
    updateCurrency();
    window.addEventListener('currencyChange', updateCurrency);
    return () => window.removeEventListener('currencyChange', updateCurrency);
  }, []);

  const formatCurrency = (amount) => {
    if (currency === 'USD') {
      return `$${(amount / 83).toFixed(2)}`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        const data = await response.json();
        if (response.ok && data.product) {
          setProduct(data.product);
        } else {
          router.push('/products');
        }
      } catch (err) {
        console.error("Error loading product", err);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    if (params.slug) load();
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="bg-gold-light min-vh-100 flex-column d-flex">
        <SiteHeader />
        <main className="container py-5 text-center flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center py-5">
            <div className="spinner-border text-danger mb-3" role="status"></div>
            <p className="text-muted">Loading premium product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;
  const savings = originalPrice ? originalPrice - displayPrice : 0;
  const savingsPct = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product);
    router.push('/checkout');
  };

  return (
    <div className="bg-gold-light min-vh-100 flex-column d-flex">
      <SiteHeader />

      <main className="container px-4 px-lg-5 py-5 flex-grow-1">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 d-flex align-items-center gap-2 small text-muted animate__animated animate__fadeIn">
          <Link href="/" className="text-decoration-none text-muted hover-text-cherry">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="text-decoration-none text-muted hover-text-cherry">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-dark fw-medium">{product.name}</span>
        </nav>

        {/* Back Link */}
        <Link href="/products" className="text-decoration-none text-cherry fw-semibold mb-4 d-inline-flex align-items-center gap-2 small animate__animated animate__fadeIn">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* Detail Grid */}
        <div className="row g-5 mt-1">
          {/* Left Column: Image & Badges */}
          <div className="col-lg-6 animate__animated animate__fadeInLeft">
            <div className="bg-white p-3 rounded-4 shadow-sm border border-light overflow-hidden">
              <div className="position-relative rounded-3 overflow-hidden bg-light" style={{ height: '450px' }}>
                <img 
                  src={product.images?.[activeImageIndex] ?? '/placeholder.png'} 
                  alt={product.name} 
                  style={{ height: '450px', width: '100%', objectFit: 'cover' }}
                />
                {originalPrice && (
                  <span className="position-absolute top-0 start-0 m-3 badge bg-danger text-white rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, #D2143A 0%, #8B0000 100%) !important' }}>
                    Save {savingsPct}%
                  </span>
                )}
              </div>

              {/* Multi-angle image thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="d-flex gap-2 mt-3 overflow-auto pb-2 justify-content-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className="border rounded-3 overflow-hidden p-0 bg-transparent"
                      style={{
                        width: '70px',
                        height: '70px',
                        borderColor: activeImageIndex === idx ? 'var(--cherry)' : '#E5E7EB',
                        borderWidth: activeImageIndex === idx ? '2px' : '1px',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <img src={img} alt={`${product.name} angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Quality Badges */}
              <div className="row g-3 mt-3 text-center">
                <div className="col-4">
                  <div className="p-3 bg-gold-light rounded-3 border border-light">
                    <Leaf size={20} className="text-success mb-2" />
                    <p className="fw-semibold small text-dark mb-0" style={{ fontSize: '0.75rem' }}>100% Organic</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-gold-light rounded-3 border border-light">
                    <ShieldCheck size={20} className="text-cherry mb-2" />
                    <p className="fw-semibold small text-dark mb-0" style={{ fontSize: '0.75rem' }}>Lab Certified</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-gold-light rounded-3 border border-light">
                    <Truck size={20} className="text-warning mb-2" />
                    <p className="fw-semibold small text-dark mb-0" style={{ fontSize: '0.75rem' }}>Secure Packing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Form */}
          <div className="col-lg-6 animate__animated animate__fadeInRight">
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-uppercase text-muted fw-bold d-block mb-2" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>
                  {product.categoryName || 'Organic Product'}
                </span>
                
                <h1 className="fw-bold text-dark mb-3 display-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {product.name}
                </h1>

                {/* Rating & Brand */}
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < 4 ? '#C5A880' : 'none'} stroke={i < 4 ? '#C5A880' : '#CCCCCC'} />
                    ))}
                    <span className="text-muted small ms-1">(4.8 rating)</span>
                  </div>
                  <span className="text-muted">|</span>
                  <span className="text-muted small">Brand: <strong className="text-dark">{product.brand || 'Hill & Valley'}</strong></span>
                </div>

                <hr className="my-4 border-light" />

                {/* Price Panel */}
                <div className="mb-4">
                  <div className="d-flex align-items-end gap-3">
                    <span className="display-5 fw-bold text-cherry" style={{ lineHeight: 1 }}>{formatCurrency(displayPrice)} <span className="text-muted" style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ {product.unit || 'piece'}</span></span>
                    {originalPrice && (
                      <span className="fs-5 text-muted text-decoration-line-through mb-1">{formatCurrency(originalPrice)}</span>
                    )}
                  </div>
                  {originalPrice && (
                    <p className="text-success small fw-semibold mt-2 mb-0">
                      ✓ Inclusive of all taxes (You Save {formatCurrency(savings)}!)
                    </p>
                  )}
                </div>

                {/* Spec Indicators Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Selling Unit:</span>
                      <strong className="text-dark small">{product.unit || 'piece'}</strong>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Availability:</span>
                      {product.stockQuantity > 0 ? (
                        <span className="text-success small fw-bold">✓ In Stock</span>
                      ) : (
                        <span className="text-secondary small fw-bold">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">Description</h6>
                  <p className="text-muted small" style={{ lineHeight: '1.7' }}>
                    {product.description || 'Discover our premium selection of farm-fresh estate spices. Carefully sorted, graded, and vacuum sealed to retain rich culinary benefits and natural moisture content.'}
                  </p>
                </div>
              </div>

              {/* Action Panel */}
              <div className="border-top pt-4">
                {product.stockQuantity > 0 ? (
                  <div>
                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <span className="text-muted small fw-semibold">Quantity:</span>
                      <div className="d-flex align-items-center border border-light rounded-pill p-1 bg-light">
                        <button 
                          className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center" 
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                          -
                        </button>
                        <span className="px-3 fw-bold text-dark" style={{ minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                        <button 
                          className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center" 
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => setQuantity(q => q + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <button 
                          onClick={handleAddToCart}
                          className="btn w-100 py-3 rounded-pill btn-cherry fw-bold d-flex align-items-center justify-content-center gap-2"
                        >
                          {added ? (
                            <>
                              <Check size={18} /> <span>Added to Bag!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={18} /> <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="col-sm-6">
                        <button 
                          onClick={handleBuyNow}
                          className="btn w-100 py-3 rounded-pill btn-gold fw-bold text-white"
                        >
                          Buy It Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-secondary w-100 py-3 rounded-pill fw-bold" disabled>
                    Product Out Of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs/Accordions */}
        <section className="mt-5 bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light animate__animated animate__fadeInUp">
          <h4 className="fw-bold text-dark mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Cooking Tips & Recommendations</h4>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="border-start border-cherry border-3 ps-3 mb-4">
                <h6 className="fw-bold text-dark">Suggested Culinary Uses</h6>
                <p className="text-muted small">{product.culinaryUses || "Perfect for brewing aromatic masala chais, baking sweet pastries, or flavoring high-end rice pilaf and curry sauces."}</p>
              </div>
              <div className="border-start border-cherry border-3 ps-3">
                <h6 className="fw-bold text-dark">Authentic Sourcing Guarantee</h6>
                <p className="text-muted small">{product.sourcingGuarantee || "Ethically hand-picked from family estates in high-altitude zones, dried in temperature-controlled spaces to protect flavor retention."}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border-start border-cherry border-3 ps-3 mb-4">
                <h6 className="fw-bold text-dark">Storage & Care</h6>
                <p className="text-muted small">{product.storageCare || "Keep inside an airtight glass container, stored in a cool, dry, dark cupboard away from direct sunshine to retain natural moisture oils."}</p>
              </div>
              <div className="border-start border-cherry border-3 ps-3">
                <h6 className="fw-bold text-dark">Allergen Safety</h6>
                <p className="text-muted small">{product.allergenSafety || "Gluten-free, vegan-safe, and processed in a 100% peanut-free hygienic corporate packing environment."}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
