import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ collegeId: '', name: '', email: '', password: '' });
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
      <div style={styles.left}>
        <div style={styles.hero}>
          <div style={styles.heroIcon}>🎓</div>
          <h1 style={styles.heroTitle}>Join RidePool GEU</h1>
          <p style={styles.heroSub}>Only GEU students can register. Verify with your college ID and GEU email.</p>
          <div style={styles.steps}>
            {[
              { n: '1', t: 'Register with college ID' },
              { n: '2', t: 'Offer or find a ride' },
              { n: '3', t: 'Earn credits by driving' },
            ].map(s => (
              <div key={s.n} style={styles.step}>
                <div style={styles.stepNum}>{s.n}</div>
                <span style={styles.stepText}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.sub}>Get started in seconds</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { name: 'collegeId', label: 'College ID', placeholder: 'e.g. 23021605', type: 'text' },
              { name: 'name',      label: 'Full name',  placeholder: 'Your full name',  type: 'text' },
              { name: 'email',     label: 'GEU Email',  placeholder: 'id@geu.ac.in',    type: 'email' },
              { name: 'password',  label: 'Password',   placeholder: '••••••••',        type: 'password' },
            ].map(f => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input style={styles.input} name={f.name} type={f.type}
                  placeholder={f.placeholder} value={form[f.name]}
                  onChange={handleChange} required />
              </div>
            ))}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={styles.link}>
            Already have an account? <Link to="/login" style={styles.linkA}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:     { display: 'flex', minHeight: '100vh' },
  left:     { flex: 1, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  right:    { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  hero:     { maxWidth: '420px' },
  heroIcon: { fontSize: '3rem', marginBottom: '1rem' },
  heroTitle:{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.03em' },
  heroSub:  { color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.7' },
  steps:    { display: 'flex', flexDirection: 'column', gap: '1rem' },
  step:     { display: 'flex', alignItems: 'center', gap: '1rem' },
  stepNum:  { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  stepText: { color: 'var(--text-secondary)', fontSize: '0.95rem' },
  card:     { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  title:    { fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
  sub:      { color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' },
  field:    { marginBottom: '1.1rem' },
  label:    { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' },
  input:    { width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' },
  btn:      { width: '100%', padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error:    { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', fontSize: '0.9rem' },
  link:     { textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  linkA:    { color: 'var(--accent)', fontWeight: '600' }
};

export default Register;