import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/comments - Add a comment to a card
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { content, cardId } = await req.json();

    if (!content || !cardId) {
      return NextResponse.json({ error: 'Текст комментария и ID карточки обязательны' }, { status: 400 });
    }

    // Verify card exists and belongs to a board owned by this user
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: {
          board: { ownerId: user.userId },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Карточка не найдена или доступ ограничен' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        userId: user.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
