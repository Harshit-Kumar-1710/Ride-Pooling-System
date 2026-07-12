import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const { token }             = useParams();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Hero */}
      <div style={styles.left}>
        <div style={styles.hero}>
          <div style={styles.heroIconWrap}>
            <span style={styles.heroIcon}>🔒</span>
          </div>
          <h1 style={styles.heroTitle}>
            SET YOUR NEW<br />
            <span style={styles.heroAccent}>PASSWORD.</span>
          </h1>
          <p style={styles.heroSub}>
            Choose a strong password to keep your account safe. After resetting, you can login with your new password.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          {success ? (
            <div style={styles.successWrap}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.successTitle}>Password Reset!</h2>
              <p style={styles.successSub}>
                Your password has been updated successfully. You can now login with your new password.
              </p>
              <button style={styles.btn} onClick={() => navigate('/login')}>
                Login Now →
              </button>
            </div>
          ) : (
            <>
              <h2 style={styles.title}>New password</h2>
              <p style={styles.sub}>Enter and confirm your new password</p>

              {error && <div style={styles.error}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input
                    style={styles.input}
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    style={styles.input}
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <button style={styles.btn} type="submit" disabled={loading}>
                  {loading ? (
                    <span style={styles.btnLoading}>
                      <span style={styles.spinner} /> Resetting...
                    </span>
                  ) : 'Reset Password →'}
                </button>
              </form>

              <p style={styles.link}>
                <Link to="/login" style={styles.linkA}>← Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  left: { flex: 1, background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', overflow: 'hidden' },
  hero: { maxWidth: '460px', animation: 'slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0 },
  heroIconWrap: { marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' },
  heroIcon: { fontSize: '3.5rem', display: 'inline-block' },
  heroTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '3.8rem', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-0.04em', marginBottom: '1.2rem' },
  heroAccent: { color: 'var(--accent)' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.8rem', width: '100%', maxWidth: '420px', animation: 'slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards', opacity: 0, boxShadow: 'var(--shadow)' },
  title: { fontFamily: "'Outfit', sans-serif", fontSize: '1.7rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
  sub: { color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.92rem' },
  field: { marginBottom: '1.2rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s ease' },
  btn: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)' },
  btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  spinner: { display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  error: { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', fontSize: '0.88rem', animation: 'fadeInUp 0.3s ease' },
  link: { textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' },
  linkA: { color: 'var(--accent)', fontWeight: '600' },
  successWrap: { textAlign: 'center', animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' },
  successIcon: { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
  successTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' },
  successSub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' },
};

export default ResetPassword;
