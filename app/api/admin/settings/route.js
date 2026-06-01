import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();
    let setting = await Setting.findOne();
    if (!setting) {
        setting = new Setting(body);
    }
    else {
        setting.storeName = body.storeName || setting.storeName;
        setting.logo = body.logo || setting.logo;
        setting.contactEmail = body.contactEmail || setting.contactEmail;
        setting.phone = body.phone || setting.phone;
        setting.address = body.address || setting.address;
        setting.currency = body.currency || setting.currency;
        setting.taxRate = Number(body.taxRate ?? setting.taxRate);
        setting.shippingFee = Number(body.shippingFee ?? setting.shippingFee);
        setting.socialLinks = {
            facebook: body.facebook || setting.socialLinks?.facebook,
            instagram: body.instagram || setting.socialLinks?.instagram,
            twitter: body.twitter || setting.socialLinks?.twitter,
        };
    }
    await setting.save();
    return NextResponse.json({ message: 'Settings updated' });
}
