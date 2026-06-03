import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();
  if (!role || !['admin', 'manager', 'store manager', 'super admin', 'superadmin'].includes(role)) {
    return false;
  }
  return true;
}

export async function GET(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }
  await connectToDatabase();
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return NextResponse.json({ success: true, settings: setting });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
    if (!(await checkAuth())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    await connectToDatabase();
    try {
      let setting = await Setting.findOne();
      if (!setting) {
          setting = new Setting(body);
      } else {
          setting.storeName = body.storeName !== undefined ? body.storeName : setting.storeName;
          setting.logo = body.logo !== undefined ? body.logo : setting.logo;
          setting.contactEmail = body.contactEmail !== undefined ? body.contactEmail : setting.contactEmail;
          setting.phone = body.phone !== undefined ? body.phone : setting.phone;
          setting.address = body.address !== undefined ? body.address : setting.address;
          setting.currency = body.currency !== undefined ? body.currency : setting.currency;
          setting.taxRate = Number(body.taxRate ?? setting.taxRate);
          setting.shippingFee = Number(body.shippingFee ?? setting.shippingFee);
          setting.socialLinks = {
              facebook: body.facebook !== undefined ? body.facebook : setting.socialLinks?.facebook,
              instagram: body.instagram !== undefined ? body.instagram : setting.socialLinks?.instagram,
              twitter: body.twitter !== undefined ? body.twitter : setting.socialLinks?.twitter,
          };
          
          // Customizer settings
          if (body.themeMode !== undefined) setting.themeMode = body.themeMode;
          if (body.primaryColor !== undefined) setting.primaryColor = body.primaryColor;
          if (body.bgColor !== undefined) setting.bgColor = body.bgColor;
          if (body.fontColor !== undefined) setting.fontColor = body.fontColor;
          if (body.bigFontColor !== undefined) setting.bigFontColor = body.bigFontColor;
          if (body.smallFontColor !== undefined) setting.smallFontColor = body.smallFontColor;
          
          // Hero CMS content
          if (body.heroTitle !== undefined) setting.heroTitle = body.heroTitle;
          if (body.heroSubtitle !== undefined) setting.heroSubtitle = body.heroSubtitle;
          if (body.heroImage !== undefined) setting.heroImage = body.heroImage;
          if (body.heroBtnText !== undefined) setting.heroBtnText = body.heroBtnText;
          if (body.heroBtnLink !== undefined) setting.heroBtnLink = body.heroBtnLink;
      }
      await setting.save();
      return NextResponse.json({ success: true, message: 'Settings updated' });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
