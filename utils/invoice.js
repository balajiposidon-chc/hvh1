/**
 * Utility helper to handle order invoice printing and PDF downloading.
 */

/**
 * Opens a print dialog with a beautifully formatted HTML invoice.
 * @param {Object} order - The order document object.
 */
export function printInvoiceHTML(order) {
  if (!order) return;

  const orderId = order._id ? order._id.toString().toUpperCase() : 'N/A';
  const orderShortId = orderId.length > 6 ? orderId.slice(-6) : orderId;
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const userName = order.user?.name || 'Customer';
  const userEmail = order.user?.email || 'N/A';
  const userPhone = order.phone || 'N/A';
  
  const street = order.shippingAddress?.street || 'N/A';
  const city = order.shippingAddress?.city || 'N/A';
  const state = order.shippingAddress?.state || 'N/A';
  const zipCode = order.shippingAddress?.zipCode || 'N/A';
  const paymentMethod = order.paymentMethod || 'COD';
  const status = order.status || 'Pending';

  // Seller Details
  const store = order.store || {};
  const sellerName = store.name || 'Hill & Valley Spices Head Office';
  const sellerAddress = store.location || 'Main Estate, Cumbum Road, Idukki, Kerala - 685551';
  const sellerPhone = store.contactNumber || '+91 94471 23456';
  const sellerEmail = store.email || 'info@hillandvalley.com';

  const itemsHTML = (order.orderItems || []).map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center; font-family: monospace;">${item.hsnCode || '0908'}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center; font-family: monospace;">${item.gstRate !== undefined ? item.gstRate : 5}%</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">₹${item.price.toLocaleString()}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${item.unit || 'piece'}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #1e293b;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const subtotal = order.itemsPrice || 0;
  const shipping = order.shippingPrice || 0;
  const tax = order.taxPrice || 0;
  const total = order.totalPrice || order.total || 0;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocker is preventing the invoice window from opening. Please enable pop-ups.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - #ORD-${orderShortId}</title>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #334155;
          margin: 0;
          padding: 40px;
          background-color: #fff;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
          padding: 30px;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #b91c1c; /* Cherry / Red Accent */
          letter-spacing: -0.025em;
        }
        .logo span {
          color: #1e293b;
        }
        .title {
          font-size: 18px;
          font-weight: 700;
          text-align: right;
          color: #475569;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .meta-box h4 {
          margin: 0 0 10px 0;
          color: #1e293b;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }
        .meta-box p {
          margin: 4px 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .table-box {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .table-box th {
          background-color: #f8fafc;
          padding: 12px 8px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
        }
        .summary-box {
          display: flex;
          justify-content: flex-end;
        }
        .summary-table {
          width: 300px;
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 8px 0;
          font-size: 14px;
        }
        .summary-table tr.total-row td {
          font-weight: 800;
          font-size: 18px;
          color: #b91c1c;
          border-top: 2px solid #f1f5f9;
          padding-top: 12px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-box {
            box-shadow: none;
            border: none;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
        .print-btn-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
          max-width: 800px;
          margin: 0 auto 20px auto;
        }
        .btn {
          background-color: #b91c1c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar no-print">
        <button class="btn" onclick="window.print()">Print Invoice</button>
      </div>
      <div class="invoice-box">
        <div class="header">
          <div class="logo">HILL & VALLEY <span>SPICES</span></div>
          <div class="title">TAX INVOICE<br/><span style="font-size: 12px; font-weight: normal; color: #94a3b8;">#ORD-${orderShortId}</span></div>
        </div>
        
        <div class="meta-grid">
          <div class="meta-box">
            <h4>Billed To</h4>
            <p><strong>${userName}</strong></p>
            <p>Email: ${userEmail}</p>
            <p>Phone: ${userPhone}</p>
            <p>Address: ${street}, ${city}, ${state} - ${zipCode}</p>
          </div>
          <div class="meta-box">
            <h4>Sold By</h4>
            <p><strong>${sellerName}</strong></p>
            <p>Address: ${sellerAddress}</p>
            <p>Phone: ${sellerPhone}</p>
            <p>Email: ${sellerEmail}</p>
          </div>
          <div class="meta-box" style="text-align: right;">
            <h4>Invoice Details</h4>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
        </div>

        <table class="table-box">
          <thead>
            <tr>
              <th style="text-align: left; width: 35%;">Item Description</th>
              <th style="text-align: center; width: 12%;">HSN</th>
              <th style="text-align: center; width: 10%;">GST %</th>
              <th style="text-align: center; width: 15%;">Price</th>
              <th style="text-align: center; width: 13%;">Qty</th>
              <th style="text-align: right; width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="summary-box">
          <table class="summary-table">
            <tr>
              <td style="color: #64748b;">Subtotal</td>
              <td style="text-align: right; font-weight: 600;">₹${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Shipping Fee</td>
              <td style="text-align: right; font-weight: 600;">₹${shipping.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">GST / Tax</td>
              <td style="text-align: right; font-weight: 600;">₹${tax.toLocaleString()}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount</td>
              <td style="text-align: right;">₹${total.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for choosing Hill & Valley Spices!</p>
          <p style="font-size: 10px; color: #cbd5e1; margin-top: 5px;">This is a computer generated document and does not require a signature.</p>
        </div>
      </div>
      <script>
        // Trigger print once DOM is loaded
        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            window.print();
          }, 500);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Dynamically loads jsPDF and triggers a PDF download of the invoice.
 * @param {Object} order - The order document object.
 */
export async function downloadInvoicePDF(order) {
  if (!order) return;

  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const orderId = order._id ? order._id.toString().toUpperCase() : 'N/A';
    const orderShortId = orderId.length > 6 ? orderId.slice(-6) : orderId;
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    // Seller Details
    const store = order.store || {};
    const sellerName = store.name || 'Hill & Valley Spices Head Office';
    const sellerAddress = store.location || 'Main Estate, Cumbum Road, Idukki, Kerala - 685551';
    const sellerPhone = store.contactNumber || '+91 94471 23456';
    const sellerEmail = store.email || 'info@hillandvalley.com';
    
    // Theme Colors
    const primaryColor = [185, 28, 28]; // Cherry Red (#b91c1c)
    const textColorDark = [30, 41, 59]; // Slate 800 (#1e293b)
    const textColorMuted = [100, 116, 139]; // Slate 500 (#64748b)
    const lightGray = [248, 250, 252]; // Slate 50 (#f8fafc)
    const borderGray = [226, 232, 240]; // Slate 200 (#e2e8f0)

    // 1. Header Band
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title / Brand (Hill & Valley Logo)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("HILL & VALLEY SPICES", 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Premium Organics & Estate Spices", 15, 23);

    // INVOICE Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("TAX INVOICE", pageWidth - 70, 19);

    // 2. Invoice Details Grid (Y: 40) - 3 Columns
    doc.setTextColor(...textColorDark);
    doc.setFontSize(9);
    
    // Column 1: Billing details (X: 15)
    doc.setFont('helvetica', 'bold');
    doc.text("Billed To:", 15, 42);
    doc.setFont('helvetica', 'normal');
    const name = order.user?.name || 'Customer';
    const email = order.user?.email || 'N/A';
    const phone = order.phone || 'N/A';
    const street = order.shippingAddress?.street || 'N/A';
    const city = order.shippingAddress?.city || 'N/A';
    const state = order.shippingAddress?.state || 'N/A';
    const zipCode = order.shippingAddress?.zipCode || 'N/A';
    
    doc.text(name, 15, 47);
    doc.setTextColor(...textColorMuted);
    doc.text(`Email: ${email}`, 15, 52);
    doc.text(`Phone: ${phone}`, 15, 57);
    doc.text(`Addr: ${street},`, 15, 62);
    doc.text(`${city}, ${state} - ${zipCode}`, 15, 67);

    // Column 2: Seller details (X: pageWidth / 3 + 5)
    const col2X = pageWidth / 3 + 5;
    doc.setTextColor(...textColorDark);
    doc.setFont('helvetica', 'bold');
    doc.text("Sold By:", col2X, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(sellerName, col2X, 47);
    doc.setTextColor(...textColorMuted);
    doc.text(`Email: ${sellerEmail}`, col2X, 52);
    doc.text(`Phone: ${sellerPhone}`, col2X, 57);
    
    // Split and format address lines
    let addrLine1 = sellerAddress;
    let addrLine2 = '';
    const commaIdx = sellerAddress.indexOf(',', 22);
    if (commaIdx !== -1) {
      addrLine1 = sellerAddress.substring(0, commaIdx + 1);
      addrLine2 = sellerAddress.substring(commaIdx + 1).trim();
    } else if (sellerAddress.length > 25) {
      addrLine1 = sellerAddress.substring(0, 25) + '...';
    }
    doc.text(`Addr: ${addrLine1}`, col2X, 62);
    if (addrLine2) {
      doc.text(addrLine2, col2X + 9, 67);
    }

    // Column 3: Invoice Info (X: 2 * pageWidth / 3 + 5)
    const col3X = 2 * pageWidth / 3 + 5;
    doc.setTextColor(...textColorDark);
    doc.setFont('helvetica', 'bold');
    doc.text("Invoice Info:", col3X, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order: #ORD-${orderShortId}`, col3X, 47);
    doc.setTextColor(...textColorMuted);
    doc.text(`ID: ${orderId.substring(0, 14)}`, col3X, 52);
    doc.text(`Date: ${dateStr}`, col3X, 57);
    doc.text(`Payment: ${order.paymentMethod || 'COD'}`, col3X, 62);
    doc.text(`Status: ${order.status || 'Pending'}`, col3X, 67);

    // Horizontal Line Separator
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.5);
    doc.line(15, 73, pageWidth - 15, 73);

    // 3. Table Header
    let currentY = 82;
    doc.setFillColor(...lightGray);
    doc.rect(15, currentY, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColorMuted);
    
    doc.text("ITEM DESCRIPTION", 18, currentY + 5.5);
    doc.text("HSN", pageWidth - 105, currentY + 5.5, { align: 'center' });
    doc.text("GST %", pageWidth - 85, currentY + 5.5, { align: 'center' });
    doc.text("UNIT PRICE", pageWidth - 63, currentY + 5.5, { align: 'right' });
    doc.text("QTY", pageWidth - 43, currentY + 5.5, { align: 'center' });
    doc.text("TOTAL", pageWidth - 18, currentY + 5.5, { align: 'right' });
    
    doc.line(15, currentY + 8, pageWidth - 15, currentY + 8);
    currentY += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColorDark);
    
    (order.orderItems || []).forEach(item => {
      // Check for page overflow
      if (currentY > pageHeight - 50) {
        doc.addPage();
        // Redraw Header Band on new page
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Invoice - #ORD-${orderShortId}`, 15, 10);
        currentY = 25;
      }

      // Draw Row
      doc.setFont('helvetica', 'bold');
      doc.text(item.name, 18, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFont('courier', 'normal');
      doc.text(item.hsnCode || '0908', pageWidth - 105, currentY + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.gstRate !== undefined ? item.gstRate : 5}%`, pageWidth - 85, currentY + 6, { align: 'center' });
      doc.text(`₹${item.price.toLocaleString()}`, pageWidth - 63, currentY + 6, { align: 'right' });
      doc.text(`${item.quantity} ${item.unit || 'piece'}`, pageWidth - 43, currentY + 6, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(`₹${(item.price * item.quantity).toLocaleString()}`, pageWidth - 18, currentY + 6, { align: 'right' });
      
      // Bottom border for row
      doc.setDrawColor(...borderGray);
      doc.line(15, currentY + 9, pageWidth - 15, currentY + 9);
      currentY += 9;
    });

    // 4. Financial Calculations Summary Box
    currentY += 5;
    const summaryX = pageWidth - 90;
    
    const subtotal = order.itemsPrice || 0;
    const shipping = order.shippingPrice || 0;
    const tax = order.taxPrice || 0;
    const total = order.totalPrice || order.total || 0;

    doc.setFontSize(9);
    doc.setTextColor(...textColorMuted);
    doc.setFont('helvetica', 'normal');
    
    doc.text("Subtotal:", summaryX, currentY);
    doc.text(`₹${subtotal.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    currentY += 6;

    doc.text("Shipping Fee:", summaryX, currentY);
    doc.text(`₹${shipping.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    currentY += 6;

    doc.text("GST / Tax:", summaryX, currentY);
    doc.text(`₹${tax.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    currentY += 8;

    // Total Row
    doc.setDrawColor(...borderGray);
    doc.line(summaryX, currentY - 5, pageWidth - 15, currentY - 5);
    
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    
    doc.text("Total Amount:", summaryX, currentY);
    doc.text(`₹${total.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });

    // 5. Invoice Footer
    doc.setFontSize(8);
    doc.setTextColor(...textColorMuted);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for shopping with Hill & Valley Spices!", pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text("This is a computer generated document. No signature required.", pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    doc.save(`invoice_ORD-${orderShortId}.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}
