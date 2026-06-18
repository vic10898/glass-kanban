import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glass Kanban - Управление проектами',
  description: 'Современный и стильный сервис для управления проектами и задачами в стиле Kanban',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
