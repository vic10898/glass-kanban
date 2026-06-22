# Glass Kanban — Управление проектами и задачами

[![Code Climate Maintainability](https://api.codeclimate.com/v1/badges/placeholder-id/maintainability)](https://codeclimate.com/github/practical-tutorials/project-based-learning)

Современное веб-приложение для организации рабочих процессов и отслеживания задач в стиле Kanban-доски. Проект разработан на стеке Next.js и TypeScript с использованием красивого полупрозрачного дизайна в стиле Glassmorphism и темной темы. Приложение позволяет группировать задачи по колонкам, перетаскивать их с помощью drag-and-drop, детально настраивать карточки (срок, приоритет, описание) и вести обсуждения в комментариях.

---

## 🛠 Стек технологий

*   **Frontend**: React 18, Next.js 14 (App Router), TypeScript, Vanilla CSS (CSS Modules + CSS variables)
*   **Backend**: Next.js API Routes, JWT-based cookies, BCrypt.js (хеширование паролей)
*   **База данных & ORM**: Prisma ORM, SQLite (локально) / PostgreSQL (в деплое)
*   **Дизайн**: Элементы Lucide React, Glassmorphism, CSS Custom Animations

---

## 🚀 Как запустить локально

Для запуска вам понадобится установленная среда Node.js (версии 18.0.0 или выше).

1.  **Установите зависимости**:
    ```bash
    npm install
    ```

2.  **Запустите миграции базы данных (создастся локальный файл dev.db)**:
    ```bash
    npx prisma db push
    ```

3.  **Запустите сервер разработки**:
    ```bash
    npm run dev
    ```

4.  **Откройте приложение**:
    Перейдите по адресу [http://localhost:3000](http://localhost:3000) в браузере.

---

## ☁️ Деплой (ссылка на работающий сайт)

*   **Работающая веб-версия**: https://glass-kanban.vercel.app
*   **Тестовые данные для авторизации (из Технического паспорта)**:
    *   **Email**: `demo@example.com`
    *   **Пароль**: `password123`

---

## 📊 Оценка качества кода

Проект настроен для анализа в системе **Code Climate**. Файл конфигурации `.codeclimate.yml` находится в корне репозитория. После привязки вашего GitHub-репозитория к сервису Code Climate вы сможете заменить ссылку на бейдж в начале этого файла на вашу индивидуальную.
