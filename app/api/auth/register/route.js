export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connect from '../../../../services/db';
import User from '../../../../models/User';
import bcrypt from 'bcrypt';
import validators from '../../../../utils/validators';
const { validateEmail, validatePassword, sanitizeString } = validators;

export async function POST(request) {
  await connect();
  const body = await request.json();
  const email = sanitizeString(body.email || '').toLowerCase();
  const password = body.password;
  const firstName = sanitizeString(body.firstName || '');
  const lastName = sanitizeString(body.lastName || '');

  if (!validateEmail(email) || !validatePassword(password)) {
    return NextResponse.json({ message: 'A valid email and password are required.' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'Email is already registered.' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, firstName, lastName, role: 'Customer' });
  await user.save();

  return NextResponse.json({ success: true, message: 'Account created successfully.' });
}
