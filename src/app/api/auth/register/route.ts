import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Все поля (email, пароль, имя) обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set cookie and return user info
    const response = NextResponse.json(
      {
        message: 'Регистрация успешна',
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );

    response.headers.set('Set-Cookie', setTokenCookie(token));
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
