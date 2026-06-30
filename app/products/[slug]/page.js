'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Leaf, Truck, Check, ChevronRight, Share2, Download, Send } from 'lucide-react';
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
  const [settings, setSettings] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSharePlatform, setActiveSharePlatform] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [brochureGenerating, setBrochureGenerating] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  const handleShareClick = async (platform) => {
    setActiveSharePlatform(platform);
    setShowShareModal(true);
    setBrochureGenerating(true);
    try {
      const url = await generateBrochure();
      setBrochureUrl(url);
    } catch (err) {
      console.error("Failed to generate brochure", err);
    } finally {
      setBrochureGenerating(false);
    }
  };

  const getWhatsAppShareLink = () => {
    const text = `*Hill & Valley Spices* - Check out this premium product: *${product.name}*\nPrice: ${formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)} / ${product.unit || 'piece'}\nSourced from nature, perfected by tradition.\n\nOrder online here: ${window.location.href}`;
    const whatsappNum = settings?.socialLinks?.whatsapp;
    if (whatsappNum) {
      const cleanNum = whatsappNum.replace(/[^\d+]/g, '');
      return `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight, align = 'center', draw = true) => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        if (draw) ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (draw) ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const generateBrochure = async () => {
    const logoSrc = '/logo.jpg';
    const productSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';

    const [logoImg, productImg] = await Promise.all([
      loadImage(logoSrc),
      loadImage(productSrc)
    ]);

    // Create a temporary off-screen canvas to measure heights accurately
    const dummyCanvas = document.createElement('canvas');
    const dummyCtx = dummyCanvas.getContext('2d');

    // 1. Calculate dynamic width based on length of product name and description
    let canvasWidth = 1080;
    const descText = product.description || 'Discover our premium selection of farm-fresh estate spices. Carefully sorted, graded, and vacuum sealed to retain rich aroma.';
    if (product.name.length <= 15 && descText.length <= 150) {
      canvasWidth = 900;
    }

    const centerX = canvasWidth / 2;
    const leftMargin = Math.round(canvasWidth * 0.11);
    const contentWidth = canvasWidth - 2 * leftMargin;

    // 2. Run measurement pass to determine exactly what height is required (no extra spacing)
    let nameFontSize = 64;
    if (product.name.length > 25) {
      nameFontSize = 40;
    } else if (product.name.length > 15) {
      nameFontSize = 50;
    }

    dummyCtx.font = `bold ${nameFontSize}px Georgia, serif`;
    let tempY = 360;
    // Measure product name
    tempY = wrapText(dummyCtx, product.name.toUpperCase(), centerX, tempY, canvasWidth - 220, nameFontSize + 12, 'center', false);
    
    // Category label
    tempY += 15 + 20; // 20px font
    tempY += 45; // Spacing before image
    
    // Image Circle
    const circleRadius = 200;
    const circleY = tempY + circleRadius;
    const circleBottom = circleY + circleRadius + 9;
    
    // Pricing
    const priceY = circleBottom + 45 + 38; // 38px font
    tempY = priceY;
    
    // Body Text starts
    tempY += 70; // Spacing after price
    
    // Description text
    dummyCtx.font = "italic 22px Georgia, serif";
    tempY = wrapText(dummyCtx, descText, leftMargin, tempY, contentWidth, 32, 'left', false);
    
    tempY += 24;

    // Culinary Uses
    tempY += 28; // Title height
    dummyCtx.font = "20px sans-serif";
    const usesText = product.culinaryUses || 'Perfect for brewing aromatic masala chais, baking sweet pastries, or flavoring high-end rice pilaf and curry sauces.';
    tempY = wrapText(dummyCtx, usesText, leftMargin, tempY, contentWidth, 28, 'left', false);

    tempY += 24;

    // Storage & Care
    tempY += 28; // Title height
    dummyCtx.font = "20px sans-serif";
    const storageText = product.storageCare || 'Keep inside an airtight glass container, stored in a cool, dry, dark cupboard away from direct sunshine to retain natural moisture oils.';
    tempY = wrapText(dummyCtx, storageText, leftMargin, tempY, contentWidth, 28, 'left', false);

    tempY += 24;

    // Allergen Safety
    tempY += 28; // Title height
    dummyCtx.font = "20px sans-serif";
    const allergenText = product.allergenSafety || 'Gluten-free, vegan-safe, and processed in a 100% peanut-free hygienic corporate packing environment.';
    tempY = wrapText(dummyCtx, allergenText, leftMargin, tempY, contentWidth, 28, 'left', false);

    // Spacing before footer separator
    const footerSeparatorY = tempY + 50;

    // Calculate dynamic canvas height
    const canvasHeight = Math.round(footerSeparatorY + 270);

    // 3. Create real canvas and draw
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Draw premium cream/beige background
    ctx.fillStyle = '#FAF6F0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw elegant brown borders
    ctx.strokeStyle = '#8C593B';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80);
    
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, canvasWidth - 110, canvasHeight - 110);

    // 1. Draw Logo
    if (logoImg) {
      const logoX = centerX;
      const logoY = 140;
      const logoRadius = 55;

      ctx.save();
      // Draw elegant outer rings for logo
      ctx.strokeStyle = '#C5A880';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#8C593B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius + 8, 0, Math.PI * 2);
      ctx.stroke();

      // Clip logo inside circle
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, logoX - logoRadius, logoY - logoRadius, logoRadius * 2, logoRadius * 2);
      ctx.restore();
    }

    // 2. Header text, shifted down below the logo
    ctx.fillStyle = '#4A2E1B';
    ctx.font = "bold 38px Georgia, serif";
    ctx.textAlign = 'center';
    const storeName = settings?.storeName || 'HILL & VALLEY SPICES';
    ctx.fillText(storeName.toUpperCase(), centerX, 240);

    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 15px sans-serif";
    ctx.fillText('PREMIUM ESTATE SPICES  •  ESTD. 2026', centerX, 280);

    // Horizontal elegant separator line
    ctx.strokeStyle = 'rgba(140, 89, 59, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 190, 305);
    ctx.lineTo(centerX + 190, 305);
    ctx.stroke();

    // 3. Product Name (dynamically sized and wrapped)
    let currentY = 360;
    ctx.fillStyle = '#4A2E1B';
    ctx.font = `bold ${nameFontSize}px Georgia, serif`;
    currentY = wrapText(ctx, product.name.toUpperCase(), centerX, currentY, canvasWidth - 220, nameFontSize + 12, 'center');

    // 4. Category
    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 20px sans-serif";
    ctx.fillText((product.categoryName || 'Organic Spices').toUpperCase(), centerX, currentY);
    currentY += 45; // Spacing before image

    // 5. Product Image
    const circleX = centerX;
    const realCircleY = currentY + circleRadius;

    // Draw product image or placeholder
    if (productImg) {
      // Draw shadows / outer rings
      ctx.strokeStyle = '#C5A880';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(circleX, realCircleY, circleRadius + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#8C593B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(circleX, realCircleY, circleRadius + 9, 0, Math.PI * 2);
      ctx.stroke();

      // Clip product image inside circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, realCircleY, circleRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(productImg, circleX - circleRadius, realCircleY - circleRadius, circleRadius * 2, circleRadius * 2);
      ctx.restore();
    } else {
      // Placeholder if image failed to load
      ctx.fillStyle = '#C5A880';
      ctx.beginPath();
      ctx.arc(circleX, realCircleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "bold 32px sans-serif";
      ctx.fillText('[ IMAGE ]', circleX, realCircleY + 10);
    }

    // Overlap badge (Organic Badge)
    const badgeX = circleX + circleRadius - 20;
    const badgeY = realCircleY - circleRadius + 20;
    ctx.fillStyle = '#D2143A';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 55, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = "bold 14px sans-serif";
    ctx.fillText('100%', badgeX, badgeY - 8);
    ctx.fillText('ORGANIC', badgeX, badgeY + 12);

    // 6. Pricing (below product image)
    const realPriceY = realCircleY + circleRadius + 65;
    ctx.fillStyle = '#4A2E1B';
    ctx.font = "bold 38px sans-serif";
    const formattedPrice = formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price);
    ctx.fillText(`${formattedPrice} / ${product.unit || 'piece'}`, centerX, realPriceY);

    // 7. Body Content Details
    ctx.textAlign = 'left';
    let textY = realPriceY + 70;

    // Description
    ctx.fillStyle = '#4A2E1B';
    ctx.font = "italic 22px Georgia, serif";
    textY = wrapText(ctx, descText, leftMargin, textY, contentWidth, 32, 'left');
    
    textY += 24;

    // Culinary Uses
    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 20px sans-serif";
    ctx.fillText('CULINARY USES:', leftMargin, textY);
    textY += 28;
    ctx.fillStyle = '#5C4033';
    ctx.font = "20px sans-serif";
    textY = wrapText(ctx, usesText, leftMargin, textY, contentWidth, 28, 'left');

    textY += 24;

    // Storage & Care
    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 20px sans-serif";
    ctx.fillText('STORAGE & CARE:', leftMargin, textY);
    textY += 28;
    ctx.fillStyle = '#5C4033';
    ctx.font = "20px sans-serif";
    textY = wrapText(ctx, storageText, leftMargin, textY, contentWidth, 28, 'left');

    textY += 24;

    // Allergen Safety
    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 20px sans-serif";
    ctx.fillText('ALLERGEN SAFETY:', leftMargin, textY);
    textY += 28;
    ctx.fillStyle = '#5C4033';
    ctx.font = "20px sans-serif";
    textY = wrapText(ctx, allergenText, leftMargin, textY, contentWidth, 28, 'left');

    // 8. Footer Section
    // Draw Footer Separator line
    ctx.strokeStyle = 'rgba(140, 89, 59, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftMargin, footerSeparatorY);
    ctx.lineTo(canvasWidth - leftMargin, footerSeparatorY);
    ctx.stroke();

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(storeName.toUpperCase(), centerX, footerSeparatorY + 40);

    ctx.fillStyle = '#5C4033';
    ctx.font = "16px sans-serif";
    const addressText = settings?.address || 'Main Estate, Cumbum Road, Idukki, Kerala - 685551';
    ctx.fillText(addressText, centerX, footerSeparatorY + 70);

    const contactText = `Phone: ${settings?.phone || '+91 94471 23456'}  |  Email: ${settings?.email || 'info@hillandvalley.com'}`;
    ctx.fillText(contactText, centerX, footerSeparatorY + 105);

    ctx.fillStyle = '#8C593B';
    ctx.font = "bold 20px sans-serif";
    ctx.fillText('ORDER ONLINE: WWW.HILLANDVALLEY.COM', centerX, footerSeparatorY + 145);

    return canvas.toDataURL('image/jpeg', 0.95);
  };

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

                    {/* Social Share / Flyer Generator */}
                    <div className="mt-4 pt-3 border-top">
                      <p className="text-muted small fw-bold mb-2 uppercase tracking-wider animate__animated animate__fadeIn" style={{ letterSpacing: '1px' }}>Generate Professional Brochure:</p>
                      <div className="d-flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleShareClick('whatsapp')}
                          className="btn btn-sm btn-outline-success rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1.5"
                        >
                          <Share2 size={14} /> WhatsApp Share
                        </button>
                        <button 
                          onClick={() => handleShareClick('facebook')}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1.5"
                        >
                          <Share2 size={14} /> Facebook Post
                        </button>
                        <button 
                          onClick={() => handleShareClick('instagram')}
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1.5"
                        >
                          <Share2 size={14} /> Instagram Ad
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

      {showShareModal && (
        <div className="modal fade show d-block animate__animated animate__fadeIn" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ backgroundColor: '#fff' }}>
              <div className="modal-header border-0 pb-0 justify-content-between p-4">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Share2 className="text-cherry" size={20} />
                  <span>Product Brochure Poster</span>
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowShareModal(false);
                    setBrochureUrl('');
                  }}
                  aria-label="Close"
                  style={{ outline: 'none', border: 'none', background: 'transparent', fontSize: '1.25rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body p-4 text-center">
                {brochureGenerating ? (
                  <div className="py-5">
                    <div className="spinner-border text-danger mb-3" role="status"></div>
                    <p className="text-muted small">Generating professional advertisement poster...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted small mb-3">Here is your dynamically generated professional brochure indicating the quality of our site:</p>
                    
                    {/* Brochure Preview */}
                    {brochureUrl && (
                      <div className="rounded-3 overflow-hidden border border-light shadow-sm mb-4" style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <img src={brochureUrl} alt="Brochure Preview" className="w-100 h-auto" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-grid gap-2 mb-3">
                      <a 
                        href={brochureUrl} 
                        download={`HV_${product.name.replace(/\s+/g, '_')}_brochure.jpg`}
                        className="btn btn-cherry rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none text-white"
                      >
                        <Download size={18} />
                        <span>Download JPEG Brochure</span>
                      </a>

                      {activeSharePlatform === 'whatsapp' && (
                        <a 
                          href={getWhatsAppShareLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-success rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none text-white"
                        >
                          <Send size={18} />
                          <span>Send on WhatsApp</span>
                        </a>
                      )}

                      {activeSharePlatform === 'facebook' && (
                        <a 
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none text-white"
                        >
                          <Send size={18} />
                          <span>Share on Facebook</span>
                        </a>
                      )}
                    </div>

                    {/* Instagram Specific Instructions */}
                    {activeSharePlatform === 'instagram' && (
                      <div className="bg-light p-3 rounded-3 text-start small border mb-3">
                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>How to share on Instagram:</h6>
                        <ol className="text-muted ps-3 mb-3" style={{ fontSize: '0.75rem' }}>
                          <li>Click <strong>Download JPEG Brochure</strong> to save it to your device.</li>
                          <li>Open Instagram and upload the poster to your Feed or Story.</li>
                          <li>Copy the professional caption below to paste under your post:</li>
                        </ol>
                        <div className="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                          <span className="text-muted text-truncate me-2" style={{ maxWidth: '280px', fontSize: '0.7rem' }}>
                            Experience the authentic purity and rich aroma of Hill & Valley Spices...
                          </span>
                          <button 
                            onClick={copyInstagramCaption}
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold shrink-0"
                            style={{ fontSize: '0.7rem' }}
                          >
                            Copy Caption
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
