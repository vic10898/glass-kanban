'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Kanban, Plus, LogOut, Layout, Clock, ChevronRight } from 'lucide-react';

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndBoards();
  }, []);

  const fetchUserAndBoards = async () => {
    try {
      // Get user info
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/');
        return;
      }
      const meData = await meRes.json();
      setUserName(meData.user.name);

      // Get boards
      const boardsRes = await fetch('/api/boards');
      if (boardsRes.ok) {
        const boardsData = await boardsRes.json();
        setBoards(boardsData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при создании доски');
      }

      setBoards([data, ...boards]);
      setNewTitle('');
      setNewDesc('');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <Kanban size={24} />
          <span>Glass Kanban</span>
        </div>
        <div className="navbar-user">
          <span className="navbar-user-name">Привет, {userName || 'Пользователь'}</span>
          <button
            id="logoutBtn"
            onClick={handleLogout}
            className="btn btn-icon"
            title="Выйти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Мои доски проектов</h1>
            <p style={styles.subtitle}>Выберите существующий рабочий процесс или создайте новый</p>
          </div>
          <button
            id="openCreateBoardModalBtn"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Создать доску
          </button>
        </div>

        {loading ? (
          <div style={styles.infoText}>Загрузка ваших проектов...</div>
        ) : boards.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <Layout size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3>У вас пока нет досок</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Создайте свою первую Kanban-доску для отслеживания задач
            </p>
            <button
              id="emptyStateCreateBoardBtn"
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              Создать доску
            </button>
          </div>
        ) : (
          <div style={styles.boardsGrid}>
            {boards.map((board) => (
              <div
                key={board.id}
                className="glass-panel animate-fade-in"
                style={styles.boardCard}
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <div style={styles.boardCardHeader}>
                  <Layout size={20} style={{ color: 'var(--primary)' }} />
                  <ChevronRight size={18} style={styles.arrowIcon} />
                </div>
                <h3 style={styles.boardCardTitle}>{board.title}</h3>
                <p style={styles.boardCardDesc}>
                  {board.description || 'Нет описания.'}
                </p>
                <div style={styles.boardCardFooter}>
                  <Clock size={12} />
                  <span>{formatDate(board.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for creating a board */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Создание новой доски</h2>
            {error && <div style={styles.errorText}>{error}</div>}

            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label htmlFor="boardTitleInput">Название доски</label>
                <input
                  id="boardTitleInput"
                  type="text"
                  className="form-control"
                  placeholder="Разработка веб-приложения"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="boardDescInput">Описание (необязательно)</label>
                <textarea
                  id="boardDescInput"
                  className="form-control"
                  placeholder="Опишите цели, рамки проекта или команду..."
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  id="closeBoardModalBtn"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setNewTitle('');
                    setNewDesc('');
                  }}
                  disabled={submitting}
                >
                  Отмена
                </button>
                <button
                  id="submitBoardBtn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: '40px 24px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '28px',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  infoText: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    marginTop: '20px',
  },
  boardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '8px',
  },
  boardCard: {
    padding: '24px',
    cursor: 'pointer',
    transition: 'var(--transition)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '180px',
  },
  boardCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  arrowIcon: {
    color: 'var(--text-muted)',
    opacity: 0,
    transform: 'translateX(-5px)',
    transition: 'var(--transition)',
  },
  boardCardTitle: {
    fontSize: '18px',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    transition: 'var(--transition)',
  },
  boardCardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '16px',
    flexGrow: 1,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  boardCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '500px',
    padding: '32px',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px',
  },
  errorText: {
    color: '#f87171',
    background: 'rgba(239, 68, 68, 0.1)',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
};

// Add boardCard hover behavior on client-side through standard CSS in template
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .glass-panel[style*="cursor: pointer"]:hover {
      background: var(--bg-card-hover) !important;
      border-color: rgba(99, 102, 241, 0.3) !important;
      transform: translateY(-2px);
      box-shadow: 0 12px 40px 0 rgba(99, 102, 241, 0.1) !important;
    }
    .glass-panel[style*="cursor: pointer"]:hover svg[style*="color: var(--text-muted)"] {
      opacity: 1 !important;
      transform: translateX(0) !important;
      color: var(--primary) !important;
    }
  `;
  document.head.appendChild(styleEl);
}
