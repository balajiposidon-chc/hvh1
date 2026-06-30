import { ImageResponse } from 'next/og';
import connect from '@/services/db';
import Product from '@/models/Product';
// Import Category model to ensure the schema is registered for mongoose populate
import Category from '@/models/Category';

export const runtime = 'nodejs'; // Use nodejs runtime to connect to MongoDB

export const alt = 'Hill & Valley Spices Product Brochure';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
  await connect();
  const product = await Product.findOne({ slug: params.slug, status: { $in: ['active', 'Active'] } })
    .populate('category', 'name');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.hillandvalley.com';
  const logoUrl = `${baseUrl}/logo.jpg`;

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF6F0',
            color: '#4A2E1B',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', margin: '0 0 10px 0' }}>HILL & VALLEY SPICES</h1>
          <p style={{ color: '#8C593B', fontSize: '20px', letterSpacing: '2px' }}>PREMIUM ESTATE SPICES</p>
        </div>
      ),
      size
    );
  }

  let productImageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';
  if (productImageUrl.startsWith('/')) {
    productImageUrl = `${baseUrl}${productImageUrl}`;
  }

  // Format currency
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#FAF6F0',
          padding: '40px',
          boxSizing: 'border-box',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Outer Border */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            border: '6px solid #8C593B',
            pointerEvents: 'none',
          }}
        />
        {/* Inner Border */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            right: '30px',
            bottom: '30px',
            border: '1.5px solid #C5A880',
            pointerEvents: 'none',
          }}
        />

        {/* Left Column: branding and circular image */}
        <div
          style={{
            width: '42%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
            <img
              src={logoUrl}
              alt="Logo"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '30px',
                border: '2px solid #C5A880',
                marginRight: '15px',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4A2E1B', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
                HILL & VALLEY
              </span>
              <span style={{ fontSize: '10px', color: '#8C593B', fontWeight: 'bold', letterSpacing: '2px' }}>
                ESTD. 2026
              </span>
            </div>
          </div>

          {/* Circular Product Image */}
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '140px',
              border: '6px solid #C5A880',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src={productImageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Organic Badge */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#D2143A',
                color: 'white',
                borderRadius: '50%',
                width: '65px',
                height: '65px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #C5A880',
                fontSize: '9px',
                fontWeight: 'bold',
              }}
            >
              <span>100%</span>
              <span style={{ fontSize: '8px' }}>ORGANIC</span>
            </div>
          </div>
        </div>

        {/* Right Column: product details */}
        <div
          style={{
            width: '58%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '30px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Category */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#8C593B',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              {product.category?.name || 'Organic Spices'}
            </span>

            {/* Product Name */}
            <h1
              style={{
                fontSize: '46px',
                fontWeight: 'bold',
                color: '#4A2E1B',
                fontFamily: 'Georgia, serif',
                margin: '0 0 15px 0',
                lineHeight: '1.2',
              }}
            >
              {product.name.toUpperCase()}
            </h1>

            {/* Price */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#4A2E1B',
                marginBottom: '20px',
              }}
            >
              <span style={{ color: '#D2143A', marginRight: '5px' }}>{formattedPrice}</span>
              <span style={{ fontSize: '20px', color: '#8C593B', fontWeight: 'normal' }}>/ {product.unit || 'piece'}</span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '18px',
                color: '#5C4033',
                fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
                lineHeight: '1.6',
                margin: '0',
              }}
            >
              {product.description || 'Discover our premium selection of farm-fresh estate spices. Carefully sorted, graded, and vacuum sealed to retain rich aroma.'}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: '1px solid rgba(140, 89, 59, 0.2)',
              paddingTop: '15px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#8C593B', letterSpacing: '1px', marginBottom: '4px' }}>
              HILL & VALLEY SPICES
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5C4033' }}>
              <span>ORDER ONLINE: WWW.HILLANDVALLEY.COM</span>
              <span>Phone: +91 94471 23456</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
