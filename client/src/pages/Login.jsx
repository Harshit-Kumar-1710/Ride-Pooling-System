import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovingCars from '../components/MovingCars';
import AnimatedStats from '../components/AnimatedStats';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ collegeId: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <button style={styles.homeBtn} onClick={() => navigate('/')}>
        ← Back to Home
      </button>
      <MovingCars count={5} />

      {/* Left — Hero */}
      <div style={styles.left}>
        <div style={styles.hero}>
          <p style={styles.heroTag}>
            <span style={styles.dash}>——</span> COLLEGE RIDE SHARING
          </p>
          <h1 style={styles.heroTitle}>
            RIDE<br />
            <span style={styles.heroItalic}>TOGETHER.</span>
          </h1>
          <p style={styles.heroSub}>
            Share rides with fellow GEU students. Save money. Earn credits. Travel safe.
          </p>
          <div style={styles.features}>
            {[
              'Free to ride — pay with credits',
              'Earn credits by offering rides',
              'College-verified riders only',
              'Smart NLP route matching',
            ].map((f, i) => (
              <div key={f} style={{ ...styles.feature, animationDelay: `${0.6 + i * 0.1}s` }}>
                <span style={styles.featureCheck}>✓</span> {f}
              </div>
            ))}
          </div>

          {/* Mini stats */}
          <AnimatedStats />
        </div>
      </div>

      {/* Right — Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.sub}>Login with your college ID</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>COLLEGE ID</label>
              <input
                style={styles.input}
                name="collegeId"
                placeholder="e.g. 23021605"
                value={form.collegeId}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <input
                style={styles.input}
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? (
                <span style={styles.btnLoading}>
                  <span style={styles.spinner} /> Logging in...
                </span>
              ) : (
                'LOGIN →'
              )}
            </button>
          </form>

          <p style={styles.link}>
            New to RidePool?{' '}
            <Link to="/register" style={styles.linkA}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    position: 'relative',
  },
  
  homeBtn: {
    position: 'absolute',
    top: '2rem',
    left: '2.5rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    zIndex: 10,
    padding: '0.5rem',
    transition: 'color 0.2s',
  },

  /* ── Left Hero ── */
  left: {
    flex: 1,
    background: 'linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  hero: {
    maxWidth: '480px',
    animation: 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    opacity: 0,
  },
  heroTag: {
    color: 'var(--accent)',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '1.2rem',
  },
  dash: { color: 'var(--accent)', marginRight: '0.5rem' },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
    fontWeight: '900',
    lineHeight: '0.95',
    letterSpacing: '-0.04em',
    marginBottom: '1.2rem',
  },
  heroItalic: {
    color: 'var(--accent)',
    fontStyle: 'italic',
  },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginBottom: '2rem',
    lineHeight: '1.7',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    marginBottom: '2.5rem',
  },
  feature: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    animation: 'fadeInUp 0.5s ease forwards',
    opacity: 0,
  },
  featureCheck: {
    color: 'var(--accent)',
    fontWeight: '700',
    fontSize: '0.85rem',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--accent-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(230,57,70,0.2)',
  },

  /* ── Right Form ── */
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.8rem',
    width: '100%',
    maxWidth: '420px',
    animation: 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
    opacity: 0,
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.7rem',
    fontWeight: '900',
    marginBottom: '0.4rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
    fontSize: '0.92rem',
  },
  field: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
    letterSpacing: '0.08em',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  forgotRow: {
    textAlign: 'right',
    marginBottom: '1rem',
    marginTop: '-0.5rem',
  },
  forgotLink: {
    color: 'var(--accent)',
    fontSize: '0.82rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
  btn: {
    width: '100%',
    padding: '0.9rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.88rem',
    fontWeight: '800',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(230, 57, 70, 0.35)',
  },
  btnLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  error: {
    background: 'var(--red-soft)',
    border: '1px solid var(--red)',
    color: 'var(--red)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.2rem',
    fontSize: '0.88rem',
    animation: 'fadeInUp 0.3s ease',
  },
  link: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
  },
  linkA: {
    color: 'var(--accent)',
    fontWeight: '600',
  },
};

export default Login;