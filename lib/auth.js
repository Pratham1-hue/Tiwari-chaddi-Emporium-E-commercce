import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'chaddi-emporium-dev-secret-change-me';
const COOKIE_NAME = 'ce_token';

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getSession() {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    await connectDB();
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user) return null;
    return { ...user, _id: String(user._id) };
  } catch {
    return null;
  }
}

/** Reads auth from a Request (works in route handlers without next/headers quirks). */
export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match) return match[1];
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function requireUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  await connectDB();
  const user = await User.findById(payload.sub).select('-passwordHash').lean();
  if (!user) return null;
  return { ...user, _id: String(user._id) };
}

export function authCookie(token) {
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;
}

export function clearAuthCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export { COOKIE_NAME };
