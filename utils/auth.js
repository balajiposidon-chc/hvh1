import { SignJWT, jwtVerify } from 'jose';

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
  if (!secret) {
    throw new Error('JWT Secret key is not matched');
  }
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload, options = { exp: '1d' }) {
  const secret = getJwtSecretKey();
  const alg = 'HS256';
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(options.exp)
    .sign(secret);
}

export async function verifyAuth(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  return await verifyJwtToken(token);
}
