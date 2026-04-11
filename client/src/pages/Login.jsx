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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>RidePool GEU</h2>
        <p style={styles.sub}>Login with your college ID</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="collegeId" placeholder="College ID"
            value={form.collegeId} onChange={handleChange} required />
          <input style={styles.input} name="password" placeholder="Password"
            type="password" value={form.password} onChange={handleChange} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.link}>New here? <Link to="/register">Create account</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card:  { background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', color: '#1E3A5F', marginBottom: '0.3rem' },
  sub:   { textAlign: 'center', color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' },
  input: { display: 'block', width: '100%', padding: '10px 14px', margin: '0 0 1rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn:   { width: '100%', padding: '11px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  link:  { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }
};

export default Login;