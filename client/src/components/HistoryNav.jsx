import { useLocation, useNavigate, Link } from 'react-router-dom';

const HistoryNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on public / auth pages
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/'];
  if (hiddenPaths.some(p => location.pathname === p) || location.pathname.startsWith('/reset-password')) {
    return null;
  }

  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div style={styles.bar}>
      <div style={styles.historyBtns}>
        <button style={styles.navBtn} onClick={() => navigate(-1)} title="Go Back">
          ←
        </button>
        <button style={styles.navBtn} onClick={() => navigate(1)} title="Go Forward">
          →
        </button>
      </div>

      <div style={styles.breadcrumbs}>
        <Link to="/dashboard" style={styles.crumb}>Home</Link>
        {pathnames.map((value, index) => {
          if (value === 'dashboard') return null; // already handled
          
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // formatting name e.g. "offer-ride" -> "Offer ride"
          let name = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
          if (name.length > 20) name = name.substring(0, 8) + '...'; // truncate long IDs

          return (
            <span key={to} style={styles.crumbItem}>
              <span style={styles.separator}>/</span>
              {isLast ? (
                <span style={styles.crumbActive}>{name}</span>
              ) : (
                <Link to={to} style={styles.crumb}>{name}</Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.6rem 3rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: '70px', // right below navbar
    zIndex: 9,
  },
  historyBtns: {
    display: 'flex',
    gap: '0.3rem',
  },
  navBtn: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
  },
  crumbItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  separator: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  },
  crumb: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  crumbActive: {
    color: 'var(--text-primary)',
    fontWeight: '600',
  }
};

export default HistoryNav;
