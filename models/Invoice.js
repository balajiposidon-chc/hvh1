import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Refunded'], default: 'Unpaid' },
  pdfUrl: { type: String },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
