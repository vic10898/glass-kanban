const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Начало сидирования базы данных...');

  // 1. Очистка старых данных
  await prisma.comment.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.list.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Старые данные успешно удалены.');

  // 2. Создание пользователя
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Виктор Поварков',
      passwordHash,
    },
  });

  console.log(`Создан демо-пользователь: ${user.email} (Пароль: password123)`);

  // 3. Создание демонстрационной доски
  const board = await prisma.board.create({
    data: {
      title: 'Разработка веб-приложения «Glass Kanban»',
      description: 'Основной проект производственной практики в колледже. Стек: Next.js, Prisma, SQLite.',
      ownerId: user.id,
    },
  });

  console.log(`Создана доска проекта: "${board.title}"`);

  // 4. Создание колонок (списков)
  const listTodo = await prisma.list.create({
    data: { title: 'В планах', order: 0, boardId: board.id },
  });

  const listProgress = await prisma.list.create({
    data: { title: 'В работе', order: 1, boardId: board.id },
  });

  const listDone = await prisma.list.create({
    data: { title: 'Готово', order: 2, boardId: board.id },
  });

  console.log('Созданы колонки: "В планах", "В работе", "Готово".');

  // 5. Создание карточек задач (Cards)
  // Колонка: В планах
  const card1 = await prisma.card.create({
    data: {
      title: 'Настройка интеграции с Code Climate',
      description: 'Привязать репозиторий GitHub к Code Climate для получения бейджа качества кода (Maintainability Grade). Добавить бейдж в файл README.md.',
      order: 0,
      listId: listTodo.id,
      priority: 'MEDIUM',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // через 5 дней
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Подготовка видео-демонстрации работы приложения',
      description: 'Записать скринкаст работы приложения до 2 минут. Продемонстрировать: вход -> создание доски -> добавление колонок -> создание задач -> перетаскивание задач -> комментирование.',
      order: 1,
      listId: listTodo.id,
      priority: 'LOW',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
  });

  // Колонка: В работе
  const card3 = await prisma.card.create({
    data: {
      title: 'Развертывание проекта (Деплой)',
      description: 'Развернуть проект на платформе Vercel или Render. Настроить подключение к удаленной базе данных PostgreSQL (Neon.tech / Supabase). Проверить доступность сайта в режиме инкогнито.',
      order: 0,
      listId: listProgress.id,
      priority: 'HIGH',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  });

  // Колонка: Готово
  const card4 = await prisma.card.create({
    data: {
      title: 'Выбор пет-проекта из каталога',
      description: 'Выбран проект Trello Clone из репозитория practical-tutorials/project-based-learning.',
      order: 0,
      listId: listDone.id,
      priority: 'LOW',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 дня назад
    },
  });

  console.log('Созданы демонстрационные карточки задач.');

  // 6. Добавление комментариев к задачам
  await prisma.comment.create({
    data: {
      content: 'Каталог утвержден руководителем практики от колледжа. Выбор проекта полностью согласован.',
      cardId: card4.id,
      userId: user.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Нужно использовать бесплатный тариф Neon.tech для базы данных PostgreSQL. Это сэкономит время.',
      cardId: card3.id,
      userId: user.id,
    },
  });

  console.log('Добавлены демонстрационные комментарии.');
  console.log('Сидирование базы данных успешно завершено!');
}

main()
  .catch((e) => {
    console.error('Ошибка при сидировании БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
