import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        <span style={styles.brandIcon}>🚗</span>
        <span>RidePool <span style={styles.brandAccent}>GEU</span></span>
      </Link>

      {user && (
        <div style={styles.center}>
          <Link to="/dashboard" style={{ ...styles.navLink, ...(isActive('/dashboard') ? styles.navLinkActive : {}) }}>Home</Link>
          <Link to="/find-ride" style={{ ...styles.navLink, ...(isActive('/find-ride') ? styles.navLinkActive : {}) }}>Find Ride</Link>
          <Link to="/offer-ride" style={{ ...styles.navLink, ...(isActive('/offer-ride') ? styles.navLinkActive : {}) }}>Offer Ride</Link>
          <Link to="/my-rides" style={{ ...styles.navLink, ...(isActive('/my-rides') ? styles.navLinkActive : {}) }}>My Rides</Link>
        </div>
      )}

      {user && (
        <div style={styles.right}>
          <div style={styles.creditsBadge}>
            <span style={styles.creditsIcon}>⚡</span>
            <span style={styles.creditsNum}>{user.credits ?? 0}</span>
            <span style={styles.creditsLabel}>credits</span>
          </div>
          <div style={styles.avatar} onClick={() => navigate('/my-rides')}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: '64px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    color: 'var(--text-primary)', textDecoration: 'none',
    fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.02em'
  },
  brandIcon: { fontSize: '1.3rem' },
  brandAccent: { color: 'var(--accent)' },
  center: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  navLink: {
    padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.15s'
  },
  navLinkActive: {
    background: 'var(--accent-soft)', color: 'var(--accent)'
  },
  right: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  creditsBadge: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'var(--accent-soft)', border: '1px solid var(--accent)',
    padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-xl)',
  },
  creditsIcon: { fontSize: '0.9rem' },
  creditsNum: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.95rem' },
  creditsLabel: { color: 'var(--text-muted)', fontSize: '0.75rem' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer'
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid var(--border-bright)',
    color: 'var(--text-secondary)', padding: '0.3rem 0.8rem',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem'
  }
};

export default Navbar;