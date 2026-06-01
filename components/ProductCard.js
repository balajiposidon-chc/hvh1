import Link from 'next/link';

export default function ProductCard({ product }) {
    const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const originalPrice = product.discountPrice > 0 ? product.price : null;

    return (
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative animate__animated animate__fadeInUp" style={{ transition: 'all 0.3s ease' }}>
        {originalPrice && (
          <span className="position-absolute top-0 end-0 m-3 badge bg-danger text-white rounded-pill px-3 py-2" style={{ zIndex: 1 }}>
            Sale
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="d-block bg-light" style={{ height: '220px', overflow: 'hidden' }}>
          <img 
            src={product.images?.[0] ?? '/placeholder.png'} 
            alt={product.name} 
            className="w-100 h-100 hover-zoom"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          />
        </Link>
        <div className="card-body p-4 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase text-muted small fw-bold" style={{ letterSpacing: '1px' }}>{product.category}</span>
              {product.brand && <span className="text-muted small">{product.brand}</span>}
            </div>
            <h5 className="card-title fw-bold mb-2">
              <Link href={`/products/${product.slug}`} className="text-decoration-none text-dark hover-text-cherry" style={{ transition: 'color 0.2s' }}>
                {product.name}
              </Link>
            </h5>
            <p className="card-text text-muted small mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '60px' }}>{product.description}</p>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
            <div>
              <span className="fs-5 fw-bold text-cherry">₹{displayPrice}</span>
              {originalPrice && <span className="text-muted text-decoration-line-through ms-2 small">₹{originalPrice}</span>}
            </div>
            <Link href={`/products/${product.slug}`} className="btn btn-sm btn-cherry px-3">
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
}
