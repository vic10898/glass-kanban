import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/cards/[id] - Update card details (title, description, listId, order, dueDate, priority)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, description, listId, order, dueDate, priority } = body;

    // Verify card exists and belongs to a board owned by this user
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        list: {
          board: { ownerId: user.userId },
        },
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Карточка не найдена или доступ ограничен' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;

    // If card is being moved to another list, verify target list ownership
    if (listId !== undefined && listId !== existingCard.listId) {
      const targetList = await prisma.list.findFirst({
        where: {
          id: listId,
          board: { ownerId: user.userId },
        },
      });

      if (!targetList) {
        return NextResponse.json({ error: 'Целевой список не найден или доступ ограничен' }, { status: 400 });
      }

      updateData.listId = listId;
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// DELETE /api/cards/[id] - Delete card
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id } = params;

    // Verify card exists and belongs to a board owned by this user
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        list: {
          board: { ownerId: user.userId },
        },
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Карточка не найдена или доступ ограничен' }, { status: 404 });
    }

    await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Карточка успешно удалена' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
