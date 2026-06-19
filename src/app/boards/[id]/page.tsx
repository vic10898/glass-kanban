'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Kanban, ArrowLeft, Plus, Trash2, X, Clock, 
  Calendar, AlertCircle, MessageSquare, Edit2, Check 
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Card {
  id: string;
  title: string;
  description: string | null;
  order: number;
  listId: string;
  dueDate: string | null;
  priority: string; // LOW, MEDIUM, HIGH
  comments: Comment[];
  createdAt: string;
}

interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  description: string | null;
  lists: List[];
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Board editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedBoardTitle, setEditedBoardTitle] = useState('');

  // Column creation
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  // Card creation (keyed by listId)
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>({});
  const [addingCardToListId, setAddingCardToListId] = useState<string | null>(null);

  // Card details modal
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [editedCardTitle, setEditedCardTitle] = useState('');
  const [editedCardDesc, setEditedCardDesc] = useState('');
  const [editedCardPriority, setEditedCardPriority] = useState('MEDIUM');
  const [editedCardDueDate, setEditedCardDueDate] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const fetchBoardDetails = async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Не удалось загрузить доску');
      }
      const data = await res.json();
      setBoard(data);
      setEditedBoardTitle(data.title);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Board Handlers ---
  const handleUpdateBoardTitle = async () => {
    if (!editedBoardTitle.trim() || editedBoardTitle === board?.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedBoardTitle }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBoard(prev => prev ? { ...prev, title: updated.title } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm('Вы действительно хотите удалить эту доску со всеми списками и карточками?')) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- List Handlers ---
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newListTitle, boardId }),
      });
      if (res.ok) {
        const newList = await res.json();
        newList.cards = [];
        setBoard(prev => prev ? { ...prev, lists: [...prev.lists, newList] } : null);
        setNewListTitle('');
        setIsAddingList(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Удалить этот список задач?')) return;
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      if (res.ok) {
        setBoard(prev => prev ? {
          ...prev,
          lists: prev.lists.filter(l => l.id !== listId)
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateListTitle = async (listId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setBoard(prev => prev ? {
          ...prev,
          lists: prev.lists.map(l => l.id === listId ? { ...l, title: newTitle } : l)
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Card Handlers ---
  const handleCreateCard = async (listId: string) => {
    const cardTitle = newCardTitles[listId];
    if (!cardTitle || !cardTitle.trim()) return;

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cardTitle, listId }),
      });
      if (res.ok) {
        const newCard = await res.json();
        newCard.comments = [];
        setBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: prev.lists.map(l => {
              if (l.id === listId) {
                return { ...l, cards: [...l.cards, newCard] };
              }
              return l;
            })
          };
        });
        setNewCardTitles(prev => ({ ...prev, [listId]: '' }));
        setAddingCardToListId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCardDetails = async () => {
    if (!activeCard) return;
    try {
      const res = await fetch(`/api/cards/${activeCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedCardTitle,
          description: editedCardDesc,
          priority: editedCardPriority,
          dueDate: editedCardDueDate || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        updated.comments = activeCard.comments; // Preserve comments in state
        
        // Update local board state
        setBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: prev.lists.map(l => ({
              ...l,
              cards: l.cards.map(c => c.id === activeCard.id ? { ...c, ...updated } : c)
            }))
          };
        });

        setActiveCard({ ...activeCard, ...updated });
        alert('Карточка сохранена');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async () => {
    if (!activeCard) return;
    if (!confirm('Вы действительно хотите удалить эту карточку?')) return;
    try {
      const res = await fetch(`/api/cards/${activeCard.id}`, { method: 'DELETE' });
      if (res.ok) {
        setBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: prev.lists.map(l => ({
              ...l,
              cards: l.cards.filter(c => c.id !== activeCard.id)
            }))
          };
        });
        setActiveCard(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Comment Handlers ---
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard || !newCommentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText, cardId: activeCard.id }),
      });
      if (res.ok) {
        const newComment = await res.json();
        const updatedComments = [newComment, ...activeCard.comments];
        
        // Update active card details state
        const updatedCard = { ...activeCard, comments: updatedComments };
        setActiveCard(updatedCard);

        // Update board state
        setBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: prev.lists.map(l => ({
              ...l,
              cards: l.cards.map(c => c.id === activeCard.id ? updatedCard : c)
            }))
          };
        });

        setNewCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeCard) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        const updatedComments = activeCard.comments.filter(c => c.id !== commentId);
        const updatedCard = { ...activeCard, comments: updatedComments };
        setActiveCard(updatedCard);

        setBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: prev.lists.map(l => ({
              ...l,
              cards: l.cards.map(c => c.id === activeCard.id ? updatedCard : c)
            }))
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId || !board) return;

    // Find card and its current list
    let sourceListId = '';
    let draggedCard: Card | null = null;

    for (const list of board.lists) {
      const found = list.cards.find(c => c.id === cardId);
      if (found) {
        draggedCard = found;
        sourceListId = list.id;
        break;
      }
    }

    if (!draggedCard || sourceListId === targetListId) return;

    // Optimistic UI Update
    setBoard(prev => {
      if (!prev) return null;
      
      // Remove from source list
      const updatedLists = prev.lists.map(l => {
        if (l.id === sourceListId) {
          return { ...l, cards: l.cards.filter(c => c.id !== cardId) };
        }
        if (l.id === targetListId) {
          // Append to target list (we can also recalculate order on drop later)
          const updatedCard = { ...draggedCard!, listId: targetListId };
          return { ...l, cards: [...l.cards, updatedCard] };
        }
        return l;
      });

      return { ...prev, lists: updatedLists };
    });

    // Make API Call to update database
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: targetListId }),
      });
      if (!res.ok) {
        // Rollback on failure
        fetchBoardDetails();
      }
    } catch (err) {
      console.error(err);
      fetchBoardDetails();
    }
  };

  const openCardDetails = (card: Card) => {
    setActiveCard(card);
    setEditedCardTitle(card.title);
    setEditedCardDesc(card.description || '');
    setEditedCardPriority(card.priority || 'MEDIUM');
    setEditedCardDueDate(card.dueDate ? card.dueDate.substring(0, 10) : '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Загрузка доски...
      </div>
    );
  }

  if (error || !board) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
        <div>Ошибка: {error || 'Доска не найдена'}</div>
        <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Board Header */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            id="backToDashboardBtn"
            onClick={() => router.push('/dashboard')}
            className="btn btn-icon"
            title="Назад к доскам"
          >
            <ArrowLeft size={18} />
          </button>
          
          {isEditingTitle ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="editBoardTitleInput"
                type="text"
                className="form-control"
                style={{ width: '220px', padding: '6px 12px' }}
                value={editedBoardTitle}
                onChange={(e) => setEditedBoardTitle(e.target.value)}
                onBlur={handleUpdateBoardTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateBoardTitle()}
                autoFocus
              />
              <button onClick={handleUpdateBoardTitle} className="btn btn-icon" style={{ padding: '6px' }}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px' }}>{board.title}</h1>
              <button
                id="editBoardTitleBtn"
                onClick={() => setIsEditingTitle(true)}
                className="btn btn-icon"
                style={{ padding: '4px' }}
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>

        <div>
          <button
            id="deleteBoardBtn"
            onClick={handleDeleteBoard}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
          >
            <Trash2 size={16} />
            Удалить доску
          </button>
        </div>
      </header>

      {/* Kanban Board Container */}
      <div style={styles.boardWrapper}>
        <div style={styles.boardScrollContainer}>
          {board.lists.map((list) => (
            <div
              key={list.id}
              className="glass-panel"
              style={styles.column}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              {/* Column Header */}
              <div style={styles.columnHeader}>
                <input
                  type="text"
                  defaultValue={list.title}
                  onBlur={(e) => handleUpdateListTitle(list.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  style={styles.columnTitleInput}
                />
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="btn btn-icon"
                  style={{ padding: '4px' }}
                  title="Удалить список"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Cards list */}
              <div style={styles.cardsList}>
                {list.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onClick={() => openCardDetails(card)}
                    style={styles.card}
                    className="glass-panel"
                  >
                    <div style={styles.cardHeader}>
                      <span className={`badge badge-${card.priority.toLowerCase()}`}>
                        {card.priority}
                      </span>
                    </div>
                    <div style={styles.cardTitle}>{card.title}</div>
                    
                    {(card.description || card.dueDate || card.comments.length > 0) && (
                      <div style={styles.cardFooter}>
                        {card.dueDate && (
                          <div style={{
                            ...styles.cardBadge,
                            color: isOverdue(card.dueDate) ? '#f87171' : 'var(--text-secondary)'
                          }}>
                            <Calendar size={12} />
                            <span>{formatDate(card.dueDate)}</span>
                          </div>
                        )}
                        {card.comments.length > 0 && (
                          <div style={styles.cardBadge}>
                            <MessageSquare size={12} />
                            <span>{card.comments.length}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Card Footer */}
              {addingCardToListId === list.id ? (
                <div style={{ padding: '0 8px 8px 8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Название карточки..."
                    style={{ padding: '8px 12px', fontSize: '13px', marginBottom: '8px' }}
                    value={newCardTitles[list.id] || ''}
                    onChange={(e) => setNewCardTitles(prev => ({ ...prev, [list.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCard(list.id)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleCreateCard(list.id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Добавить
                    </button>
                    <button
                      onClick={() => setAddingCardToListId(null)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCardToListId(list.id)}
                  style={styles.addCardBtn}
                >
                  <Plus size={14} />
                  <span>Добавить карточку</span>
                </button>
              )}
            </div>
          ))}

          {/* Create new column */}
          <div style={styles.addColumnContainer}>
            {isAddingList ? (
              <form onSubmit={handleCreateList} className="glass-panel" style={styles.addColumnForm}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Заголовок списка..."
                  style={{ padding: '8px 12px', fontSize: '13px', marginBottom: '8px' }}
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  required
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Добавить
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <button
                id="addNewListBtn"
                onClick={() => setIsAddingList(true)}
                className="glass-panel"
                style={styles.addColumnPlaceholderBtn}
              >
                <Plus size={16} />
                <span>Добавить колонку</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Details Modal */}
      {activeCard && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContent}>
            <button
              id="closeCardDetailsBtn"
              style={styles.closeBtn}
              onClick={() => setActiveCard(null)}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ marginBottom: '20px' }}>
              <input
                id="editCardDetailsTitleInput"
                type="text"
                style={styles.modalCardTitleInput}
                value={editedCardTitle}
                onChange={(e) => setEditedCardTitle(e.target.value)}
                onBlur={handleUpdateCardDetails}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                в колонке "{board.lists.find(l => l.id === activeCard.listId)?.title}"
              </span>
            </div>

            <div style={styles.modalSplitView}>
              {/* Left Column: Details & Comments */}
              <div style={styles.modalLeftCol}>
                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={styles.sectionHeader}>Описание</h3>
                  <textarea
                    id="editCardDetailsDescTextarea"
                    className="form-control"
                    style={{ minHeight: '120px', resize: 'vertical', fontSize: '13px' }}
                    placeholder="Добавьте более подробное описание к этой задаче..."
                    value={editedCardDesc}
                    onChange={(e) => setEditedCardDesc(e.target.value)}
                  />
                </div>

                {/* Comments Section */}
                <div>
                  <h3 style={styles.sectionHeader}>Обсуждение ({activeCard.comments.length})</h3>
                  
                  <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
                    <textarea
                      id="cardCommentTextarea"
                      className="form-control"
                      placeholder="Напишите комментарий..."
                      style={{ minHeight: '60px', resize: 'none', fontSize: '13px', marginBottom: '8px' }}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button
                      id="submitCardCommentBtn"
                      type="submit"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      disabled={!newCommentText.trim()}
                    >
                      Отправить
                    </button>
                  </form>

                  <div style={styles.commentsList}>
                    {activeCard.comments.map((comment) => (
                      <div key={comment.id} style={styles.commentItem}>
                        <div style={styles.commentHeader}>
                          <span style={styles.commentUser}>{comment.user.name}</span>
                          <span style={styles.commentTime}>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p style={styles.commentBody}>{comment.content}</p>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={styles.commentDeleteBtn}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions / Attributes */}
              <div style={styles.modalRightCol}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Priority Selector */}
                  <div>
                    <span style={styles.attrLabel}>Приоритет</span>
                    <select
                      id="cardPrioritySelect"
                      className="form-control"
                      style={{ padding: '8px 12px', fontSize: '13px', marginTop: '6px' }}
                      value={editedCardPriority}
                      onChange={(e) => setEditedCardPriority(e.target.value)}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  {/* Due Date Picker */}
                  <div>
                    <span style={styles.attrLabel}>Срок выполнения</span>
                    <input
                      id="cardDueDateInput"
                      type="date"
                      className="form-control"
                      style={{ padding: '8px 12px', fontSize: '13px', marginTop: '6px' }}
                      value={editedCardDueDate}
                      onChange={(e) => setEditedCardDueDate(e.target.value)}
                    />
                  </div>

                  {/* Save changes manually */}
                  <button
                    id="saveCardDetailsBtn"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={handleUpdateCardDetails}
                  >
                    Сохранить изменения
                  </button>

                  <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '10px 0' }} />

                  {/* Delete Card */}
                  <button
                    id="deleteCardBtn"
                    className="btn btn-secondary"
                    style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                    onClick={handleDeleteCard}
                  >
                    <Trash2 size={14} />
                    Удалить карточку
                  </button>
                </div>
              </div>
            </div>
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
    overflow: 'hidden',
  },
  boardWrapper: {
    flex: 1,
    padding: '24px',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  boardScrollContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    height: '100%',
    minHeight: 'calc(100vh - 120px)',
  },
  column: {
    width: '300px',
    flexShrink: 0,
    maxHeight: 'calc(100vh - 140px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  columnTitleInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    width: '80%',
    padding: '4px',
    borderRadius: '4px',
  },
  cardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flexGrow: 1,
    marginBottom: '12px',
    paddingRight: '4px',
  },
  card: {
    padding: '14px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'var(--transition)',
    userSelect: 'none',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  cardBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  addCardBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'var(--transition)',
  },
  addColumnContainer: {
    width: '300px',
    flexShrink: 0,
  },
  addColumnPlaceholderBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '16px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
  },
  addColumnForm: {
    padding: '16px',
    borderRadius: '12px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '760px',
    padding: '32px',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
  },
  modalCardTitleInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '700',
    outline: 'none',
    width: '90%',
    padding: '4px 0',
    marginBottom: '4px',
  },
  modalSplitView: {
    display: 'flex',
    gap: '32px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  modalLeftCol: {
    flex: '1 1 400px',
  },
  modalRightCol: {
    flex: '0 0 220px',
    width: '100%',
  },
  sectionHeader: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  attrLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
    maxHeight: '200px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  commentItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    position: 'relative',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: '6px',
  },
  commentUser: {
    fontWeight: '600',
    color: 'var(--primary)',
  },
  commentTime: {
    color: 'var(--text-muted)',
  },
  commentBody: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  },
  commentDeleteBtn: {
    background: 'none',
    border: 'none',
    color: '#f87171',
    fontSize: '10px',
    cursor: 'pointer',
    marginTop: '6px',
    padding: 0,
  },
};

// CSS modules styling hooks
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .glass-panel[style*="draggable"]:hover {
      background: var(--bg-card-hover) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    button[style*="cursor: pointer"]:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(styleEl);
}
