import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/lists - Create a new list
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { title, boardId } = await req.json();

    if (!title || !boardId) {
      return NextResponse.json({ error: 'Название списка и ID доски обязательны' }, { status: 400 });
    }

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: user.userId },
    });

    if (!board) {
      return NextResponse.json({ error: 'Доска не найдена или доступ ограничен' }, { status: 404 });
    }

    // Calculate order
    const listCount = await prisma.list.count({
      where: { boardId },
    });

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        order: listCount,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
