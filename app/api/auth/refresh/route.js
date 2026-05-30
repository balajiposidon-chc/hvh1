export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwtUtils from '../../../../utils/jwt';
const { verifyRefreshToken, signToken, signRefreshToken } = jwtUtils;

export async function GET(request) {
  const refresh = request.cookies.get('hill_refresh')?.value;
  if (!refresh) {
    return NextResponse.json({ message: 'Refresh token missing.' }, { status: 401 });
  }
  try {
    const payload = verifyRefreshToken(refresh);
    const accessToken = signToken({ userId: payload.userId, role: payload.role, email: payload.email });
    const newRefresh = signRefreshToken({ userId: payload.userId, role: payload.role, email: payload.email });
    const response = NextResponse.json({ accessToken });
    response.cookies.set('hill_token', accessToken, { httpOnly: true, path: '/', maxAge: 60 * 15 });
    response.cookies.set('hill_refresh', newRefresh, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Refresh token invalid.' }, { status: 401 });
  }
}
