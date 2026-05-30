function generateInvoiceNumber() {
  const date = new Date();
  const prefix = 'HV';
  const serial = String(date.getTime()).slice(-6);
  return `${prefix}-${date.getFullYear()}${serial}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

module.exports = { generateInvoiceNumber, formatCurrency };
