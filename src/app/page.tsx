'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Kanban, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Что-то пошло не так');
      }

      // Successful login/register
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftCol}>
        <div style={styles.brand}>
          <Kanban size={32} />
          <span>Glass Kanban</span>
        </div>
        <h1 style={styles.heroTitle}>
          Управление задачами. <br />
          <span style={styles.accentText}>Просто и удобно.</span>
        </h1>
        <p style={styles.heroText}>
          Канбан-доска для организации учебных и личных проектов. 
          Помогает отслеживать статус задач и не забывать о дедлайнах.
        </p>

        <div style={styles.features}>
          <div style={styles.featureItem}>
            <div style={styles.featureBullet}>✦</div>
            <div>
              <strong>Drag-and-Drop:</strong> Удобное перетаскивание карточек между колонками.
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureBullet}>✦</div>
            <div>
              <strong>Настройка задач:</strong> Приоритеты, сроки выполнения, описания и комментарии.
            </div>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureBullet}>✦</div>
            <div>
              <strong>Современный дизайн:</strong> Темная тема и эффект матового стекла (Glassmorphism).
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightCol}>
        <div className="glass-panel animate-fade-in" style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p style={styles.formSubtitle}>
            {isLogin ? 'Рады видеть вас снова!' : 'Создайте бесплатный аккаунт прямо сейчас'}
          </p>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="nameInput">Ваше имя</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    id="nameInput"
                    type="text"
                    className="form-control"
                    placeholder="Александр Иванов"
                    style={{ paddingLeft: '42px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="emailInput">Электронная почта</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  id="emailInput"
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '42px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordInput">Пароль</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  id="passwordInput"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              id="submitAuthBtn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={styles.toggleText}>
            {isLogin ? 'Еще нет аккаунта?' : 'Уже зарегистрированы?'}
            <button
              id="toggleAuthModeBtn"
              type="button"
              style={styles.toggleBtn}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '60px',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '24px',
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '44px',
    lineHeight: '1.15',
    color: '#f8fafc',
    marginBottom: '20px',
  },
  accentText: {
    color: '#6366f1',
    background: 'linear-gradient(to right, #6366f1, #14b8a6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#94a3b8',
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#94a3b8',
  },
  featureBullet: {
    color: '#14b8a6',
    fontWeight: 'bold',
  },
  rightCol: {
    flex: '1 1 400px',
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '460px',
    width: '100%',
  },
  formCard: {
    width: '100%',
    padding: '40px',
  },
  formTitle: {
    fontSize: '24px',
    color: '#f8fafc',
    marginBottom: '8px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '30px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f87171',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '24px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '6px',
    fontSize: '13px',
    outline: 'none',
  },
};
