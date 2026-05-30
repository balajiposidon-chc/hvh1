export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { uploadImage } from '../../../services/cloudinary';

export async function POST(request) {
  const body = await request.json();
  const imageData = body.image;
  if (!imageData) {
    return NextResponse.json({ message: 'Image data is required.' }, { status: 400 });
  }
  try {
    const result = await uploadImage(imageData);
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    return NextResponse.json({ message: 'Upload failed.' }, { status: 500 });
  }
}
