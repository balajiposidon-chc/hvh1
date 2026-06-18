export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import cloudinaryService from '../../../services/cloudinary';

const { uploadImage } = cloudinaryService;

export async function POST(request) {
  try {
    const body = await request.json();
    const imageData = body.image;
    
    if (!imageData) {
      return NextResponse.json({ message: 'Image data is required.' }, { status: 400 });
    }

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_KEY !== 'your-cloudinary-key' &&
      process.env.CLOUDINARY_API_SECRET && 
      process.env.CLOUDINARY_API_SECRET !== 'your-cloudinary-secret';

    if (isCloudinaryConfigured) {
      console.log('Uploading image to Cloudinary...');
      const uploadResult = await uploadImage(imageData);
      console.log('Cloudinary upload success:', uploadResult.secure_url);
      return NextResponse.json({ url: uploadResult.secure_url });
    }

    console.log('Cloudinary is not configured. Falling back to local upload...');

    // Match mime type and extract base64 encoded data
    const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ message: 'Invalid image data format. Must be base64 data URL.' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension based on mime type
    let extension = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      extension = 'jpg';
    } else if (mimeType.includes('gif')) {
      extension = 'gif';
    } else if (mimeType.includes('webp')) {
      extension = 'webp';
    } else if (mimeType.includes('svg')) {
      extension = 'svg';
    }

    // Generate unique name
    const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    
    // Ensure the public/uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ message: 'Upload failed.', error: error.message }, { status: 500 });
  }
}

