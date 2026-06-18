import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}
