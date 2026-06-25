'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Eye, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const router = useRouter();
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

    const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const originalPrice = product.discountPrice > 0 ? product.price : null;
    const savings = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
    
    // Fallback category display
    const categoryDisplay = product.categoryName || 
                            (product.category && typeof product.category === 'object' ? product.category.name : product.category) || 
                            'Spices';

    // Stars rating calculation
    const ratingValue = product.rating || 4.5;
    const fullStars = Math.floor(ratingValue);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stockQuantity > 0) {
            addToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    return (
      <div className="card h-100 border-0 glass-card overflow-hidden position-relative animate__animated animate__fadeInUp shadow-sm hover-shadow transition-all" style={{ borderRadius: '24px' }}>
        {/* Sale / Discount Badge */}
        {originalPrice && (
          <span className="position-absolute top-0 start-0 m-3 badge bg-danger text-white rounded-pill px-3 py-2 fw-bold animate__animated animate__pulse animate__infinite animate__slower" style={{ zIndex: 5, fontSize: '0.75rem', background: 'linear-gradient(135deg, #D2143A 0%, #8B0000 100%) !important' }}>
            Save {savings}%
          </span>
        )}

        {/* Product Image Grid */}
        <div 
          onClick={() => router.push(`/product/${product.slug}`)} 
          className="d-block position-relative bg-white overflow-hidden cursor-pointer" 
          style={{ height: '280px' }}
        >
          <img 
            src={product.images?.[activeImageIndex] ?? '/placeholder.png'} 
            alt={product.name} 
            className="hover-zoom"
            style={{ width: '100%', height: '280px', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)' }}
          />
          
          {/* Multi-angle image dot navigation carousel */}
          {product.images && product.images.length > 1 && (
            <div 
              className="position-absolute bottom-3 start-50 translate-middle-x d-flex gap-1.5 px-2 py-1 rounded-pill bg-dark bg-opacity-40 backdrop-blur-sm" 
              style={{ zIndex: 10, bottom: '15px' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  onMouseEnter={() => setActiveImageIndex(idx)}
                  className="rounded-circle border-0 p-0"
                  style={{
                    width: '7px',
                    height: '7px',
                    backgroundColor: activeImageIndex === idx ? 'var(--cherry-red)' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Subtle Hover Overlay */}
          <div 
            className="card-hover-overlay position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center opacity-0 bg-dark bg-opacity-25" 
            style={{ transition: 'opacity 0.3s ease', cursor: 'pointer' }} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
          >
            <button className="btn btn-light rounded-pill px-4 py-2 shadow d-flex align-items-center gap-2 text-dark font-semibold text-sm border-0">
              <Eye size={16} /> View Details
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body p-4 d-flex flex-column justify-content-between bg-white">
          <div>
            {/* Category / Brand Row */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase text-muted fw-bold" style={{ letterSpacing: '1.2px', fontSize: '0.7rem' }}>{categoryDisplay}</span>
              <span className="text-muted small px-2 py-0.5 rounded bg-light" style={{ fontSize: '0.7rem' }}>{product.brand || 'Hill & Valley'}</span>
            </div>

            {/* Title */}
            <h5 className="card-title fw-bold mb-2">
              <Link href={`/product/${product.slug}`} className="text-decoration-none text-dark hover-text-cherry" style={{ transition: 'color 0.2s', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
                {product.name}
              </Link>
            </h5>

            {/* Stars Rating */}
            <div className="d-flex align-items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => {
                const isGold = i < fullStars;
                return (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={isGold ? '#C5A880' : 'none'} 
                    stroke={isGold ? '#C5A880' : '#CCCCCC'} 
                  />
                );
              })}
              <span className="text-muted small ms-1" style={{ fontSize: '0.75rem' }}>({ratingValue})</span>
            </div>

            {/* Description */}
            <p className="card-text text-muted small mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.5' }}>
              {product.description}
            </p>
          </div>

          {/* Pricing & Stock Footer */}
          <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
            <div>
              <span className="fs-5 fw-bold text-cherry">{formatCurrency(displayPrice)} <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/ {product.unit || 'piece'}</span></span>
              {originalPrice && (
                <span className="text-muted text-decoration-line-through ms-2 small" style={{ fontSize: '0.8rem' }}>{formatCurrency(originalPrice)}</span>
              )}
            </div>
            
            {/* Stock status indicator */}
            <div>
              {product.stockQuantity <= 0 ? (
                <span className="badge bg-secondary text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.65rem' }}>Sold Out</span>
              ) : product.stockQuantity < 5 ? (
                <span className="badge bg-warning text-dark rounded-pill px-2.5 py-1" style={{ fontSize: '0.65rem' }}>Only {product.stockQuantity} left</span>
              ) : (
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1" style={{ fontSize: '0.65rem' }}>In Stock</span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-3">
            <button 
              onClick={handleAddToCart}
              className={`w-100 ${added ? 'btn-success-sm' : 'btn-cherry-sm'}`}
              disabled={product.stockQuantity <= 0}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>{product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
}
