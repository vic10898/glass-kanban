import { NextResponse } from 'next/server';
import { getLogoutCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    message: 'Выход из системы успешно выполнен',
  });
  response.headers.set('Set-Cookie', getLogoutCookie());
  return response;
}
