import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/boards/[id] - Get board details with lists and cards
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;

    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: user.userId,
      },
      include: {
        lists: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { order: 'asc' },
              include: {
                comments: {
                  orderBy: { createdAt: 'desc' },
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Доска не найдена' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching board details:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// PUT /api/boards/[id] - Update board details
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;
    const { title, description } = await req.json();

    const existingBoard = await prisma.board.findFirst({
      where: { id, ownerId: user.userId },
    });

    if (!existingBoard) {
      return NextResponse.json({ error: 'Доска не найдена или доступ ограничен' }, { status: 404 });
    }

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingBoard.title,
        description: description !== undefined ? description : existingBoard.description,
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// DELETE /api/boards/[id] - Delete board
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;

    const existingBoard = await prisma.board.findFirst({
      where: { id, ownerId: user.userId },
    });

    if (!existingBoard) {
      return NextResponse.json({ error: 'Доска не найдена или доступ ограничен' }, { status: 404 });
    }

    await prisma.board.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Доска успешно удалена' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
