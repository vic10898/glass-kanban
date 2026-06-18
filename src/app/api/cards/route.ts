import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/cards - Create a new card in a list
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { title, listId } = await req.json();

    if (!title || !listId) {
      return NextResponse.json({ error: 'Название карточки и ID списка обязательны' }, { status: 400 });
    }

    // Verify parent list exists and user owns the board it belongs to
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        board: { ownerId: user.userId },
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'Список не найден или доступ ограничен' }, { status: 404 });
    }

    // Calculate order
    const cardCount = await prisma.card.count({
      where: { listId },
    });

    const card = await prisma.card.create({
      data: {
        title,
        listId,
        order: cardCount,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
