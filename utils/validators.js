const validator = require('validator');

function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return validator.escape(value.trim());
}

function validateEmail(email) {
  return validator.isEmail(email || '');
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function validateProductPayload(payload) {
  const name = sanitizeString(payload.name);
  const description = sanitizeString(payload.description);
  const category = sanitizeString(payload.category);
  const sku = sanitizeString(payload.sku);
  const slug = sanitizeString(payload.slug);
  const price = Number(payload.price || 0);
  const offerPrice = Number(payload.offerPrice || 0);
  const stockQuantity = Number(payload.stockQuantity || 0);
  return { name, description, category, sku, slug, price, offerPrice, stockQuantity, tags: payload.tags || [] };
}

module.exports = { sanitizeString, validateEmail, validatePassword, validateProductPayload };
