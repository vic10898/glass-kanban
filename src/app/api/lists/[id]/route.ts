import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/lists/[id] - Update list title or order
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;
    const { title, order } = await req.json();

    // Verify list exists and user owns the parent board
    const existingList = await prisma.list.findFirst({
      where: {
        id,
        board: { ownerId: user.userId },
      },
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Список не найден или доступ ограничен' }, { status: 404 });
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingList.title,
        order: order !== undefined ? order : existingList.order,
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// DELETE /api/lists/[id] - Delete list
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;

    // Verify list exists and user owns the parent board
    const existingList = await prisma.list.findFirst({
      where: {
        id,
        board: { ownerId: user.userId },
      },
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Список не найден или доступ ограничен' }, { status: 404 });
    }

    await prisma.list.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Список успешно удален' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
