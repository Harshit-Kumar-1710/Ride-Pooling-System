import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Hide navbar on public / auth pages
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/'];
  if (hiddenPaths.some(p => location.pathname === p) || location.pathname.startsWith('/reset-password')) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <Link to="/dashboard" style={styles.brand}>
        <span style={styles.brandText}>
          <span style={styles.brandAccent}>RIDEPOOL</span> GEU
        </span>
      </Link>

      {/* Center Nav Links */}
      {user && (
        <div style={styles.center}>
          {[
            { path: '/dashboard', label: 'Home' },
            { path: '/find-ride', label: 'Find Ride' },
            { path: '/offer-ride', label: 'Offer Ride' },
            { path: '/my-rides', label: 'My Rides' },
            { path: '/about', label: 'About' },
          ].map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              {link.label}
              {isActive(link.path) && <span style={styles.activeBar} />}
            </Link>
          ))}
        </div>
      )}

      {/* Right Section */}
      <div style={styles.right}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={styles.themeToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user && (
          <>
            {/* Credits Badge */}
          <div style={styles.creditsBadge}>
            <span style={styles.creditsIcon}>⚡</span>
            <span style={styles.creditsNum}>{user.credits ?? 0}</span>
            <span style={styles.creditsLabel}>credits</span>
          </div>

          {/* Avatar with dropdown */}
          <div style={styles.avatarWrap}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div
              style={styles.avatar}
              onClick={() => navigate('/profile')}
              title={user.name}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {showMenu && (
              <div style={styles.dropdown}>
                <button style={styles.dropItem} onClick={() => { setShowMenu(false); navigate('/profile'); }}>👤 Profile</button>
                <button style={styles.dropItem} onClick={() => { setShowMenu(false); navigate('/help'); }}>❓ Help</button>
                <div style={styles.dropDivider} />
                <button style={{ ...styles.dropItem, color: 'var(--accent)' }} onClick={() => { setShowMenu(false); handleLogout(); }}>Logout</button>
              </div>
            )}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2.5rem',
    height: '56px',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    animation: 'fadeIn 0.5s ease-out',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '900',
    fontSize: '1.1rem',
    letterSpacing: '0.06em',
  },
  brandAccent: {
    color: 'var(--accent)',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  navLink: {
    position: 'relative',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: '600',
    transition: 'all 0.25s ease',
    letterSpacing: '0.01em',
  },
  navLinkActive: {
    color: '#fff',
    background: 'rgba(230, 57, 70, 0.1)',
  },
  activeBar: {
    position: 'absolute',
    bottom: '-1px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '18px',
    height: '2px',
    background: 'var(--accent)',
    borderRadius: '2px',
    boxShadow: '0 0 8px rgba(230,57,70,0.4)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  creditsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    background: 'rgba(230,57,70,0.08)',
    border: '1px solid rgba(230, 57, 70, 0.2)',
    padding: '0.25rem 0.75rem',
    borderRadius: '99px',
  },
  creditsIcon: { fontSize: '0.8rem' },
  creditsNum: {
    color: 'var(--accent)',
    fontWeight: '800',
    fontSize: '0.88rem',
    fontFamily: "'Outfit', sans-serif",
  },
  creditsLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.68rem',
    fontWeight: '600',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 0 2px var(--bg-primary), 0 0 0 3px var(--accent)',
  },
  dropdown: {
    position: 'absolute',
    top: '40px',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.4rem 0',
    minWidth: '150px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    zIndex: 200,
    animation: 'fadeIn 0.15s ease',
  },
  dropItem: {
    display: 'block',
    width: '100%',
    padding: '0.55rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  dropDivider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0.3rem 0',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '600',
    transition: 'all 0.25s ease',
  },
  themeToggle: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    color: 'var(--text-primary)',
  },
};

export default Navbar;