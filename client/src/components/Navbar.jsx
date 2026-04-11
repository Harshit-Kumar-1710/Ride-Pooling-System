import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>RidePool GEU</Link>
      {user && (
        <div style={styles.right}>
          <span style={styles.credits}>Credits: {user.credits ?? 0}</span>
          <span style={styles.name}>{user.name}</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.8rem 2rem', background: '#1E3A5F', color: '#fff'
  },
  brand: {
    color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem'
  },
  right: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  credits: {
    background: '#2ecc71', padding: '4px 12px',
    borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff'
  },
  name:   { fontSize: '0.9rem' },
  btn: {
    background: 'transparent', border: '1px solid #fff',
    color: '#fff', padding: '4px 12px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem'
  }
};

export default Navbar;