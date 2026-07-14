import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OTP from '@/lib/models/OTP';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ message: 'Valid email required' }, { status: 400 });
        }

        await connectToDatabase();

        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Upsert OTP in database (updates if exists, creates if not)
        await OTP.findOneAndUpdate(
            { email: email.toLowerCase() },
            { code, createdAt: new Date() },
            { upsert: true, new: true }
        );

        const postmarkApiKey = process.env.POSTMARK_API_KEY;
        const fromEmail = process.env.EMAIL_FROM;

        // Check if API key is set and not a placeholder
        if (!postmarkApiKey || postmarkApiKey === 'your_postmark_api_key_here' || postmarkApiKey.startsWith('your_') || !fromEmail || fromEmail.startsWith('your_')) {
            console.log(`\n======================================================`);
            console.log(`[Email OTP Fallback] OTP for ${email} is: ${code}`);
            console.log(`======================================================\n`);
            return NextResponse.json({ message: 'OTP sent (logged to console)' }, { status: 200 });
        }

        // Send real email using Postmark API
        const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': postmarkApiKey,
            },
            body: JSON.stringify({
                From: fromEmail,
                To: email.toLowerCase(),
                Subject: `${code} is your Hill & Valley verification code`,
                HtmlBody: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #D2143A; text-align: center;">Hill & Valley Estate Spices</h2>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p>Hello,</p>
                        <p>Thank you for registering a customer account with Hill & Valley. Please use the following 6-digit verification code to complete your registration:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background-color: #f7f7f7; padding: 10px 20px; border-radius: 4px; border: 1px dashed #ccc;">${code}</span>
                        </div>
                        <p style="color: #666; font-size: 14px;">This verification code is valid for <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
                        <p style="font-size: 12px; color: #999; text-align: center;">© 2026 Hill & Valley. All rights reserved.</p>
                    </div>
                `,
            }),
        });

        const postmarkData = await postmarkResponse.json();

        if (!postmarkResponse.ok) {
            console.error('Postmark API Error:', postmarkData);
            return NextResponse.json({ message: postmarkData.Message || 'Failed to send verification email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'OTP verification code sent' }, { status: 200 });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ message: error?.message ?? 'Internal server error' }, { status: 500 });
    }
}
