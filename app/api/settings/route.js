import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  try {
    const setting = await Setting.findOne().lean();
    if (!setting) {
      return NextResponse.json({
        success: true,
        settings: {
          storeName: 'Hill & Valley Spices Head Office',
          address: 'Main Estate, Cumbum Road, Idukki, Kerala - 685551',
          phone: '+91 94471 23456',
          email: 'info@hillandvalley.com'
        }
      });
    }
    return NextResponse.json({
      success: true,
      settings: {
        storeName: setting.storeName || 'Hill & Valley Spices Head Office',
        address: setting.address || 'Main Estate, Cumbum Road, Idukki, Kerala - 685551',
        phone: setting.phone || '+91 94471 23456',
        email: setting.contactEmail || 'info@hillandvalley.com',
        logo: setting.logo,
        currency: setting.currency || 'INR',
        taxRate: setting.taxRate !== undefined ? setting.taxRate : 5,
        shippingFee: setting.shippingFee !== undefined ? setting.shippingFee : 0
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
