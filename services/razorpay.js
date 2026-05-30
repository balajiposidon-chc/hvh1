const Razorpay = require('razorpay');

const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function createOrder(amount, currency = 'INR', receipt) {
  return client.orders.create({ amount: Math.round(amount * 100), currency, receipt, payment_capture: 1 });
}

async function fetchPayment(paymentId) {
  return client.payments.fetch(paymentId);
}

module.exports = { createOrder, fetchPayment };
