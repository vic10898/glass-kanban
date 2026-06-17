import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_1234567890';
const TOKEN_COOKIE_NAME = 'auth_token';

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Read from cookie
  const cookieValue = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (cookieValue) return cookieValue;

  // Read from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function getUserFromRequest(req: NextRequest): UserPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function setTokenCookie(token: string): string {
  // Return cookie header string or use Next.js response cookies
  return `${TOKEN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`;
}

export function getLogoutCookie(): string {
  return `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
