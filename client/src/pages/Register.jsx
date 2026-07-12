import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import AnimatedStats from '../components/AnimatedStats';

const Register = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ collegeId: '', name: '', email: '', personalEmail: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <button style={styles.homeBtn} onClick={() => navigate('/')}>
        ← Back to Home
      </button>
      <button onClick={toggleTheme} style={styles.themeToggleBtn}>
        {theme === 'dark' ? <Sun size={20} color="#e63946" /> : <Moon size={20} color="#e63946" />}
      </button>
      {/* Left — Hero */}
      <div style={styles.left}>
        <div style={styles.hero}>
          <div style={styles.heroIconWrap}>
            <span style={styles.heroIcon}>🎓</span>
          </div>
          <h1 style={styles.heroTitle}>
            JOIN THE<br />
            <span style={styles.heroAccent}>RIDE.</span>
          </h1>
          <p style={styles.heroSub}>
            Only GEU students can join. Verify with your college ID and GEU email to get started.
          </p>
          <div style={styles.steps}>
            {[
              { n: '1', t: 'Register with your college ID' },
              { n: '2', t: 'Offer or find a ride' },
              { n: '3', t: 'Earn credits by driving' },
            ].map((s, i) => (
              <div key={s.n} style={{ ...styles.step, animationDelay: `${0.5 + i * 0.15}s` }}>
                <div style={styles.stepNum}>{s.n}</div>
                <span style={styles.stepText}>{s.t}</span>
              </div>
            ))}
          </div>
          <AnimatedStats />
        </div>
      </div>

      {/* Right — Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.sub}>Get started in seconds</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'collegeId',     label: 'College ID',     placeholder: 'e.g. 23021605',        type: 'text' },
              { name: 'name',          label: 'Full Name',      placeholder: 'Your full name',       type: 'text' },
              { name: 'email',         label: 'GEU Email',      placeholder: 'id@geu.ac.in',         type: 'email' },
              { name: 'personalEmail', label: 'Personal Email', placeholder: 'your.name@gmail.com',  type: 'email' },
              { name: 'password',      label: 'Password',       placeholder: '••••••••',             type: 'password' },
            ].map((f, i) => (
              <div key={f.name} style={{ ...styles.field, animationDelay: `${0.2 + i * 0.06}s` }}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                />
                {f.name === 'personalEmail' && (
                  <span style={styles.fieldHint}>Used for password recovery</span>
                )}
              </div>
            ))}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? (
                <span style={styles.btnLoading}>
                  <span style={styles.spinner} /> Creating account...
                </span>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          <p style={styles.link}>
            Already have an account?{' '}
            <Link to="/login" style={styles.linkA}>Login</Link>
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
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    zIndex: 10,
    transition: 'color 0.2s'
  },
  themeToggleBtn: {
    position: 'absolute',
    top: '1.5rem',
    right: '2.5rem',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.2s',
  },

  /* ── Left Hero ── */
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    overflow: 'hidden',
  },
  hero: {
    maxWidth: '460px',
    animation: 'slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    opacity: 0,
  },
  heroIconWrap: {
    marginBottom: '1.5rem',
    animation: 'float 3s ease-in-out infinite',
  },
  heroIcon: {
    fontSize: '3.5rem',
    display: 'inline-block',
  },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '3.8rem',
    fontWeight: '900',
    lineHeight: '1.05',
    letterSpacing: '-0.04em',
    marginBottom: '1.2rem',
  },
  heroAccent: {
    color: 'var(--accent)',
  },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginBottom: '2rem',
    lineHeight: '1.7',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    animation: 'fadeInUp 0.5s ease forwards',
    opacity: 0,
  },
  stepNum: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--accent-soft)',
    border: '1px solid rgba(230, 57, 70, 0.3)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem',
    flexShrink: 0,
    fontFamily: "'Outfit', sans-serif",
  },
  stepText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },

  /* ── Right Form ── */
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 3rem',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.2rem 2.5rem',
    width: '100%',
    maxWidth: '440px',
    animation: 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
    opacity: 0,
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.6rem',
    fontWeight: '800',
    marginBottom: '0.3rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  field: {
    marginBottom: '1rem',
    animation: 'fadeInUp 0.4s ease forwards',
    opacity: 0,
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  fieldHint: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '0.3rem',
    fontStyle: 'italic',
  },
  btn: {
    width: '100%',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.3rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)',
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
    padding: '0.7rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    animation: 'fadeInUp 0.3s ease',
  },
  link: {
    textAlign: 'center',
    marginTop: '1.3rem',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
  },
  linkA: {
    color: 'var(--accent)',
    fontWeight: '600',
  },
};

export default Register;