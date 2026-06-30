export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/models/User';
import Store from '@/models/Store';
import Notification from '@/models/Notification';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role?.toLowerCase();
    const permissions = session.user.permissions || [];
    const isSuperAdmin = ['super admin', 'superadmin'].includes(role) || permissions.includes('rbac');

    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Fetch all orders for revenue, counts, charts, and recent order listings
    const orders = await Order.find().populate('user', 'name email').populate('store').sort({ createdAt: -1 }).lean();
    
    // 2. Counts
    const totalProducts = await Product.countDocuments();
    const lowStockItems = await Product.countDocuments({ stock: { $lte: 10 } });
    const totalCustomers = await User.countDocuments({ role: { $regex: /^customer$/i } });

    // 3. Revenue & Active Orders calculation
    const revenueOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

    // 4. Dynamic Monthly Chart Data (Last 6 Months)
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthName = monthNames[monthIndex];
      
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      
      const monthOrders = revenueOrders.filter(o => o.createdAt >= start && o.createdAt <= end);
      const rev = monthOrders.reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0);
      
      monthlyData.push({
        name: monthName,
        revenue: Math.round(rev),
        sales: monthOrders.length
      });
    }

    // 5. Recent Orders (limit to 10 for dashboard view)
    const recentOrders = orders.slice(0, 10);

    // 6. Dynamic System Notifications
    const dbNotifications = await Notification.find().sort({ createdAt: -1 }).limit(25).lean();

    function timeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }

    const notifications = dbNotifications.map(n => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      time: timeAgo(n.createdAt),
      read: n.read
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        activeOrders,
        totalCustomers,
        lowStockItems,
        totalProducts,
        totalOrders: orders.length
      },
      monthlyData,
      recentOrders,
      notifications
    });
  } catch (error) {
    console.error('Super Admin Dashboard Stats Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
