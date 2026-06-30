import Notification from '@/models/Notification';
import connectToDatabase from '@/lib/mongodb';

/**
 * Creates and logs a persistent system notification for Super Admin review.
 * @param {Object} params
 * @param {'add' | 'edit' | 'delete'} params.action - Action performed
 * @param {'order' | 'product' | 'store'} params.resourceType - Type of resource modified
 * @param {string} params.resourceId - Mongoose/DB ID of the modified resource
 * @param {string} params.details - Descriptive title or identifier (e.g. "Order #ORD-123456" or "Product 'Mango'")
 * @param {Object} params.sessionUser - The user object from session or token containing name, email, role
 */
export async function createSystemNotification({ action, resourceType, resourceId, details, sessionUser }) {
  try {
    await connectToDatabase();

    const performedBy = sessionUser ? {
      id: sessionUser.id || sessionUser._id || 'unknown',
      name: sessionUser.name || 'Unknown User',
      email: sessionUser.email || 'N/A',
      role: sessionUser.role || 'User',
    } : {
      id: 'system',
      name: 'System',
      email: 'system@hillandvalley.com',
      role: 'System',
    };

    const who = performedBy.name ? `${performedBy.name} (${performedBy.role})` : 'System';

    let type = 'info';
    let title = '';

    if (action === 'add') {
      title = `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Added`;
      type = 'success';
    } else if (action === 'edit') {
      title = `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Edited`;
      type = 'info';
    } else if (action === 'delete') {
      title = `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Deleted`;
      type = 'warning';
    }

    const message = `${details} was ${action === 'delete' ? 'deleted' : action + 'ed'} by ${who}.`;

    await Notification.create({
      title,
      message,
      type,
      action,
      resourceType,
      resourceId: resourceId ? resourceId.toString() : undefined,
      performedBy,
      read: false
    });
  } catch (error) {
    console.error('Failed to create system notification:', error);
  }
}
