import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success'],
    default: 'info',
  },
  action: {
    type: String,
    enum: ['add', 'edit', 'delete'],
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['order', 'product', 'store'],
    required: true,
  },
  resourceId: {
    type: String,
  },
  performedBy: {
    id: String,
    name: String,
    email: String,
    role: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
