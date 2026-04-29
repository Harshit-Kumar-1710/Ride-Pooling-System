import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions = [
    { icon: '🚗', title: 'Offer a ride', sub: 'Post your route and earn credits', path: '/offer-ride', color: 'var(--accent)' },
    { icon: '🔍', title: 'Find a ride',  sub: 'Search rides on your route',       path: '/find-ride',  color: 'var(--green)' },
    { icon: '📋', title: 'My rides',     sub: 'View your offered and booked rides', path: '/my-rides', color: 'var(--orange)' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.greeting}>
          <h1 style={styles.greetTitle}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={styles.greetSub}>What do you want to do today?</p>
        </div>

        <div style={styles.statsRow}>
          {[
            { label: 'Credits earned', value: user?.credits ?? 0, icon: '⚡' },
            { label: 'Your rating',    value: `${user?.rating ?? 3.0}/5`, icon: '⭐' },
            { label: 'Rides offered',  value: user?.totalRidesOffered ?? 0, icon: '🚗' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.actionsGrid}>
          {actions.map(a => (
            <div key={a.path} style={styles.actionCard}
              onClick={() => navigate(a.path)}
              onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ ...styles.actionIcon, background: a.color + '22', border: `1px solid ${a.color}44` }}>
                <span style={styles.actionEmoji}>{a.icon}</span>
              </div>
              <h3 style={styles.actionTitle}>{a.title}</h3>
              <p style={styles.actionSub}>{a.sub}</p>
              <div style={{ ...styles.actionArrow, color: a.color }}>→</div>
            </div>
          ))}
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>💡</span>
          <span style={styles.infoText}>
            Earn <strong style={{ color: 'var(--accent)' }}>10 credits</strong> base + <strong style={{ color: 'var(--accent)' }}>5 credits</strong> per passenger when you complete a ride.
          </span>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: 'var(--bg-primary)', padding: '2.5rem 1rem' },
  container:   { maxWidth: '800px', margin: '0 auto' },
  greeting:    { marginBottom: '2rem' },
  greetTitle:  { fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.3rem' },
  greetSub:    { color: 'var(--text-secondary)', fontSize: '1rem' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem', textAlign: 'center' },
  statIcon:    { fontSize: '1.5rem', marginBottom: '0.5rem' },
  statValue:   { fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.2rem' },
  statLabel:   { color: 'var(--text-muted)', fontSize: '0.8rem' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  actionCard:  { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' },
  actionIcon:  { width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  actionEmoji: { fontSize: '1.4rem' },
  actionTitle: { fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' },
  actionSub:   { color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' },
  actionArrow: { position: 'absolute', bottom: '1.5rem', right: '1.5rem', fontSize: '1.2rem', fontWeight: '700' },
  infoBox:     { background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' },
  infoIcon:    { fontSize: '1.2rem' },
  infoText:    { color: 'var(--text-secondary)', fontSize: '0.9rem' }
};

export default Dashboard;