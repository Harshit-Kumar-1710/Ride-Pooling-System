import { useState, useEffect } from 'react';

const AnimatedStats = ({ styleLayout = 'horizontal' }) => {
  // Initialize with base numbers, but check localStorage to persist the "live" feeling
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('ridepool-live-stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only use saved if they are reasonably fresh to prevent absurdly huge numbers
        if (Date.now() - parsed.timestamp < 1000 * 60 * 60 * 24) {
          return parsed.data;
        }
      } catch (e) {}
    }
    return {
      riders: 542,
      rides: 87,
      verified: 100, // percentage, stays at 100
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Randomly decide whether to increment
        const addRider = Math.random() > 0.6; // 40% chance every 3s
        const addRide = Math.random() > 0.8;  // 20% chance every 3s

        if (!addRider && !addRide) return prev;

        const nextStats = {
          ...prev,
          riders: prev.riders + (addRider ? Math.floor(Math.random() * 3) + 1 : 0),
          rides: prev.rides + (addRide ? 1 : 0),
        };

        localStorage.setItem('ridepool-live-stats', JSON.stringify({
          timestamp: Date.now(),
          data: nextStats
        }));

        return nextStats;
      });
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (styleLayout === 'landing') {
    return (
      <div style={landingStyles.statsBar}>
        <div style={landingStyles.statItem}>
          <span style={landingStyles.statNum}>{stats.riders}+</span>
          <span style={landingStyles.statLabel}>Active Riders</span>
        </div>
        <div style={landingStyles.statItem}>
          <span style={landingStyles.statNum}>{stats.rides}+</span>
          <span style={landingStyles.statLabel}>Rides Offered</span>
        </div>
        <div style={landingStyles.statItem}>
          <span style={landingStyles.statNum}>₹15k+</span>
          <span style={landingStyles.statLabel}>Student Savings</span>
        </div>
        <div style={landingStyles.statItem}>
          <span style={landingStyles.statNum}>{stats.verified}%</span>
          <span style={landingStyles.statLabel}>College Verified</span>
        </div>
      </div>
    );
  }

  // Default / Login / Register style
  return (
    <div style={styles.miniStats}>
      <div style={styles.miniStat}>
        <span style={styles.miniNum}>{stats.riders}+</span>
        <span style={styles.miniLabel}>RIDERS</span>
      </div>
      <div style={styles.miniStat}>
        <span style={styles.miniNum}>{stats.rides}+</span>
        <span style={styles.miniLabel}>RIDES</span>
      </div>
      <div style={styles.miniStat}>
        <span style={styles.miniNum}>{stats.verified}%</span>
        <span style={styles.miniLabel}>VERIFIED</span>
      </div>
    </div>
  );
};

const landingStyles = {
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.5rem 3rem', position: 'relative', zIndex: 1, background: 'var(--bg-glass)', backdropFilter: 'blur(10px)' },
  statItem: { textAlign: 'center', animation: 'countPop 0.6s ease forwards' },
  statNum: { display: 'block', fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: 'var(--accent)', fontStyle: 'italic', marginBottom: '0.3rem', transition: 'all 0.3s ease' },
  statLabel: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' },
};

const styles = {
  miniStats: { display: 'flex', gap: '3rem', marginTop: '3.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' },
  miniStat: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  miniNum: { fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent)', fontStyle: 'italic', transition: 'all 0.3s ease' },
  miniLabel: { fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--text-muted)' },
};

export default AnimatedStats;
