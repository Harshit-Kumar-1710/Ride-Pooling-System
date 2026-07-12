import { useNavigate } from 'react-router-dom';
import MovingCars from '../components/MovingCars';

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <MovingCars count={8} />
      <div style={styles.container}>

        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.logoRow}>
            <span style={styles.logoRed}>RidePool</span>
            <span style={styles.logoWhite}> GEU</span>
          </div>
          <p style={styles.tagline}>Smarter rides for Graphic Era students</p>
          <div style={styles.version}>v2.0 · Built with ❤️</div>
        </div>

        {/* Mission */}
        <div style={{ ...styles.card, animationDelay: '0.15s' }}>
          <h3 style={styles.cardTitle}>🎯 Our Mission</h3>
          <p style={styles.cardText}>
            RidePool GEU connects Graphic Era University students for affordable, 
            safe ride-sharing. Reduce costs, cut carbon emissions, and build campus 
            community — one shared ride at a time.
          </p>
        </div>

        {/* How it works */}
        <div style={{ ...styles.card, animationDelay: '0.25s' }}>
          <h3 style={styles.cardTitle}>⚙️ How It Works</h3>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={{ ...styles.stepIcon, background: 'var(--green)' }}>1</div>
              <div>
                <p style={styles.stepTitle}>Register with College ID</p>
                <p style={styles.stepDesc}>Only verified GEU students can join</p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepIcon, background: 'var(--accent)' }}>2</div>
              <div>
                <p style={styles.stepTitle}>Offer or Find a Ride</p>
                <p style={styles.stepDesc}>Use Smart Search or browse available rides</p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepIcon, background: '#f59e0b' }}>3</div>
              <div>
                <p style={styles.stepTitle}>Chat & Coordinate</p>
                <p style={styles.stepDesc}>Real-time chat with your ride group</p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={{ ...styles.stepIcon, background: '#8b5cf6' }}>4</div>
              <div>
                <p style={styles.stepTitle}>Ride, Rate & Earn</p>
                <p style={styles.stepDesc}>Complete rides, earn credits, leave reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ ...styles.card, animationDelay: '0.35s' }}>
          <h3 style={styles.cardTitle}>✨ Features</h3>
          <div style={styles.featureGrid}>
            {[
              { icon: '🧠', label: 'NLP Smart Search' },
              { icon: '🗺️', label: 'Live Map Tracking' },
              { icon: '💬', label: 'Ride Chat' },
              { icon: '⭐', label: 'Rating System' },
              { icon: '🔄', label: 'Route Optimization' },
              { icon: '📧', label: 'Email Notifications' },
              { icon: '⚡', label: 'Credit System' },
              { icon: '🔒', label: 'College-Only Access' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ ...styles.card, animationDelay: '0.45s' }}>
          <h3 style={styles.cardTitle}>🛠️ Tech Stack</h3>
          <div style={styles.techGrid}>
            {[
              { name: 'React', color: '#61dafb' },
              { name: 'Node.js', color: '#68a063' },
              { name: 'MongoDB', color: '#4db33d' },
              { name: 'Socket.io', color: '#f0f0ff' },
              { name: 'Leaflet', color: '#199900' },
              { name: 'Nodemailer', color: '#e63946' },
            ].map((t, i) => (
              <span key={i} style={{ ...styles.techBadge, borderColor: t.color, color: t.color }}>
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ ...styles.card, animationDelay: '0.55s' }}>
          <h3 style={styles.cardTitle}>👥 Team</h3>
          <p style={styles.cardText}>
            Built by Graphic Era University students as a college project to solve real 
            transportation challenges faced by students commuting to campus daily.
          </p>
        </div>

        <p style={styles.footer}>© 2026 RidePool GEU · Graphic Era University, Dehradun</p>

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem', position: 'relative' },
  container: { maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeIn 0.4s ease' },
  backBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'all 0.2s' },

  hero: { textAlign: 'center', padding: '3rem 1rem 2rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  logoRow: { marginBottom: '0.5rem' },
  logoRed: { fontFamily: "'Outfit', sans-serif", fontSize: '2.8rem', fontWeight: '900', color: 'var(--accent)', letterSpacing: '-0.03em' },
  logoWhite: { fontFamily: "'Outfit', sans-serif", fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.03em' },
  tagline: { color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '0.5rem' },
  version: { fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', display: 'inline-block', padding: '3px 12px', borderRadius: '99px' },

  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  cardTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.8rem' },
  cardText: { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' },

  steps: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  step: { display: 'flex', alignItems: 'center', gap: '0.9rem' },
  stepIcon: { width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem', flexShrink: 0 },
  stepTitle: { fontWeight: '600', fontSize: '0.9rem' },
  stepDesc: { color: 'var(--text-muted)', fontSize: '0.78rem' },

  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem' },
  featureIcon: { fontSize: '1.1rem' },
  featureLabel: { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' },

  techGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  techBadge: { fontSize: '0.78rem', fontWeight: '600', padding: '4px 12px', borderRadius: '99px', border: '1px solid', background: 'transparent' },

  footer: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2rem 0 1rem' },
};

export default About;
