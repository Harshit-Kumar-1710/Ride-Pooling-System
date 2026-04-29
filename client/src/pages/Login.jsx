import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      <div style={styles.left}>
        <div style={styles.hero}>
          <div style={styles.heroIcon}>🚗</div>
          <h1 style={styles.heroTitle}>RidePool GEU</h1>
          <p style={styles.heroSub}>Share rides, earn credits, save money. Built for GEU students.</p>
          <div style={styles.features}>
            {['Free to ride', 'Earn credits by driving', 'Safe — college verified only', 'Smart route matching'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureDot}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.sub}>Login with your college ID</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>College ID</label>
              <input style={styles.input} name="collegeId"
                placeholder="e.g. 23021605"
                value={form.collegeId} onChange={handleChange} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} name="password"
                type="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <p style={styles.link}>
            New to RidePool? <Link to="/register" style={styles.linkA}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:      { display: 'flex', minHeight: '100vh' },
  left:      { flex: 1, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  right:     { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  hero:      { maxWidth: '420px' },
  heroIcon:  { fontSize: '3rem', marginBottom: '1rem' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.03em' },
  heroSub:   { color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.7' },
  features:  { display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  feature:   { color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  featureDot:{ color: 'var(--green)', fontWeight: '700' },
  card:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  title:     { fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
  sub:       { color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' },
  field:     { marginBottom: '1.2rem' },
  label:     { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' },
  input:     { width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' },
  btn:       { width: '100%', padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error:     { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', fontSize: '0.9rem' },
  link:      { textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  linkA:     { color: 'var(--accent)', fontWeight: '600' }
};

export default Login;