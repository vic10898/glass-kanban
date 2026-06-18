import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/boards - Get all boards for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const boards = await prisma.board.findMany({
      where: { ownerId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// POST /api/boards - Create a new board
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Название доски обязательно' }, { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
        ownerId: user.userId,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
