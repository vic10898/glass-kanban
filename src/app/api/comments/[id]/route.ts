import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;

    // Verify comment exists and was created by the user or the board owner
    const comment = await prisma.comment.findFirst({
      where: { id },
      include: {
        card: {
          include: {
            list: {
              include: {
                board: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Комментарий не найден' }, { status: 404 });
    }

    const isCommentOwner = comment.userId === user.userId;
    const isBoardOwner = comment.card.list.board.ownerId === user.userId;

    if (!isCommentOwner && !isBoardOwner) {
      return NextResponse.json({ error: 'Доступ ограничен' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Комментарий удален' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
