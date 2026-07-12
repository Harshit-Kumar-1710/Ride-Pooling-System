import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import MovingCars from '../components/MovingCars';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await API.get('/rides/recommended');
        setRecommended(res.data.rides || []);
      } catch (err) { console.error(err); }
      finally { setLoadingRec(false); }
    };
    fetchRecommended();
  }, []);

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={styles.page}>
      <MovingCars count={6} />

      {/* ── Hero Section ── */}
      <section style={styles.heroSection}>
        <div style={styles.heroInner}>
          <p style={styles.heroTag}>
            <span style={styles.dash}>——</span> WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase()}
          </p>
          <h1 style={styles.heroTitle}>
            SHARE THE<br />
            <span style={styles.heroItalic}>RIDE.</span> SAVE<br />
            THE PLANET.
          </h1>
          <p style={styles.heroSub}>
            Your campus ride-sharing hub. Offer rides, find matches, earn credits.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.ctaPrimary} onClick={() => navigate('/offer-ride')}>
              OFFER A RIDE →
            </button>
            <button style={styles.ctaOutline} onClick={() => navigate('/find-ride')}>
              FIND A RIDE
            </button>
          </div>
        </div>

        {/* ── Real Ola/Uber Images ── */}
        <div style={styles.heroVisual}>
          <div style={styles.heroImgWrapper1}>
            <img src="/ola.png" alt="Ola Style Cab" style={styles.heroImg} />
            <div style={styles.heroImgLabel}>PREMIUM CABS</div>
          </div>
          <div style={styles.heroImgWrapper2}>
            <img src="/uber.png" alt="Uber Style Ride" style={styles.heroImg} />
            <div style={styles.heroImgLabelDark}>LUXURY SEDANS</div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={styles.statsBar}>
        {[
          { num: `⚡ ${user?.credits ?? 0}`, label: 'CREDITS EARNED' },
          { num: (user?.totalRidesOffered > 0) ? `${user?.rating ?? '—'}/5` : 'N/A', label: 'YOUR RATING' },
          { num: user?.totalRidesOffered ?? 0, label: 'RIDES OFFERED' },
          { num: '🛡️', label: 'GEU VERIFIED' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statItem, animationDelay: `${0.4 + i * 0.12}s` }}>
            <span style={styles.statNum}>{s.num}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Quick Actions ── */}
      <section style={styles.actionsSection}>
        <p style={styles.sectionTag}>
          <span style={styles.dash}>——</span> QUICK ACTIONS
        </p>
        <h2 style={styles.sectionTitle}>
          WHAT DO YOU <span style={styles.heroItalic}>NEED?</span>
        </h2>
        <div style={styles.actionsGrid}>
          {[
            { icon: '🚗', title: 'Offer a Ride', desc: 'Post your route, set seats, and earn credits from passengers.', path: '/offer-ride' },
            { icon: '🔍', title: 'Find a Ride', desc: 'Search by route & time. Use Smart Search for instant results.', path: '/find-ride' },
            { icon: '📋', title: 'My Rides', desc: 'Track your offered and booked rides. Chat with your group.', path: '/my-rides' },
            { icon: '👤', title: 'Profile', desc: 'View your stats, achievements, and reviews from other riders.', path: '/profile' },
          ].map((a, i) => (
            <div
              key={i}
              style={{
                ...styles.actionCard,
                ...(hoveredAction === i ? styles.actionHighlight : {}),
                animationDelay: `${0.15 + i * 0.1}s`,
              }}
              onClick={() => navigate(a.path)}
              onMouseEnter={() => setHoveredAction(i)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div style={{
                ...styles.actionIconWrap,
                ...(hoveredAction === i ? { background: 'var(--accent)', boxShadow: '0 4px 20px rgba(230,57,70,0.4)' } : {})
              }}>
                <span style={styles.actionIcon}>{a.icon}</span>
              </div>
              <h3 style={styles.actionTitle}>{a.title}</h3>
              <p style={styles.actionDesc}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recommended Rides ── */}
      <section style={styles.recSection}>
        <p style={styles.sectionTag}>
          <span style={styles.dash}>——</span> AVAILABLE NOW
        </p>
        <h2 style={styles.sectionTitle}>
          RECOMMENDED <span style={styles.heroItalic}>RIDES</span>
        </h2>

        {loadingRec ? (
          <div style={styles.recGrid}>
            {[1,2,3].map(i => (
              <div key={i} style={styles.shimmerCard} />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <div style={styles.emptyRec}>
            <p style={styles.emptyTitle}>No rides available right now</p>
            <p style={styles.emptySub}>Be the first — offer a ride and earn credits!</p>
            <button style={styles.ctaPrimary} onClick={() => navigate('/offer-ride')}>
              OFFER A RIDE →
            </button>
          </div>
        ) : (
          <div style={styles.recGrid}>
            {recommended.map((ride, i) => (
              <div
                key={ride._id}
                style={{ ...styles.recCard, animationDelay: `${0.1 + i * 0.1}s` }}
                onClick={() => navigate(`/rides/${ride._id}`, { state: { ride } })}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.recRoute}>
                  <span style={styles.recDotGreen}>●</span>
                  <span style={styles.recRouteText}>{ride.origin?.label}</span>
                </div>
                <div style={styles.recRoute}>
                  <span style={styles.recDotRed}>●</span>
                  <span style={styles.recRouteText}>{ride.destination?.label}</span>
                </div>
                <div style={styles.recMeta}>
                  <span style={styles.recChip}>🕐 {formatTime(ride.departureTime)}</span>
                  <span style={styles.recChip}>💺 {ride.seatsAvailable} seats</span>
                </div>
                <div style={styles.recDriver}>
                  <span style={styles.recAvatar}>{ride.driverId?.name?.charAt(0)}</span>
                  <span style={styles.recDriverName}>{ride.driverId?.name}</span>
                  <span style={styles.recArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Premium Fleet (Amazon Style) ── */}
      <section style={styles.fleetSection}>
        <p style={styles.sectionTag}>
          <span style={styles.dash}>——</span> RIDE IN STYLE
        </p>
        <h2 style={styles.sectionTitle}>
          OUR PREMIUM <span style={styles.heroItalic}>FLEET</span>
        </h2>
        
        <div style={styles.fleetGrid}>
          {/* Luxury Tier */}
          <div style={styles.fleetCard} onClick={() => navigate('/offer-ride')}>
            <div style={styles.fleetImgWrap}>
              <img src="/ferrari.png" alt="Luxury Sports Car" style={styles.fleetImg} />
              <span style={styles.badgeLuxury}>LUXURY</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Supercar Selection</h3>
              <p style={styles.fleetDesc}>For special occasions. Arrive like a VIP.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>500 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn}>View Fleet</button>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div style={styles.fleetCard} onClick={() => navigate('/offer-ride')}>
            <div style={styles.fleetImgWrap}>
              <img src="/audi.png" alt="Premium Sedan" style={styles.fleetImg} />
              <span style={styles.badgePremium}>PREMIUM</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Executive Sedans</h3>
              <p style={styles.fleetDesc}>Quiet, comfortable, perfect for studying on the go.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>100 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn}>View Fleet</button>
              </div>
            </div>
          </div>

          {/* Standard Tier */}
          <div style={styles.fleetCard} onClick={() => navigate('/offer-ride')}>
            <div style={styles.fleetImgWrap}>
              <img src="/cab.png" alt="Standard Cab" style={styles.fleetImg} />
              <span style={styles.badgeStandard}>STANDARD</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Everyday Commute</h3>
              <p style={styles.fleetDesc}>Reliable, clean cabs for your daily campus trips.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>20 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn}>View Fleet</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Info Box ── */}
      <section style={styles.infoBar}>
        <span style={styles.infoIcon}>💡</span>
        <span style={styles.infoText}>
          Earn <strong style={{ color: 'var(--accent)' }}>10 credits</strong> base + <strong style={{ color: 'var(--accent)' }}>5 credits</strong> per passenger when you complete a ride.
        </span>
      </section>

    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' },

  /* Hero */
  heroSection: { padding: '4rem 3rem 5rem', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' },
  heroInner: { flex: 1, animation: 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, maxWidth: '500px' },
  heroTag: { color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.2rem' },
  dash: { color: 'var(--accent)', marginRight: '0.5rem' },
  heroTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', lineHeight: '0.95', letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '1.5rem' },
  heroItalic: { color: 'var(--accent)', fontStyle: 'italic' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.7', maxWidth: '480px', marginBottom: '2rem' },
  heroBtns: { display: 'flex', gap: '1rem' },
  ctaPrimary: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '0 4px 24px rgba(230,57,70,0.4)' },
  ctaOutline: { background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '2px solid var(--accent)', padding: '0.8rem 2rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s' },
  
  heroVisual: { flex: 1, position: 'relative', height: '350px', animation: 'fadeInUp 1s ease 0.3s forwards', opacity: 0 },
  heroImgWrapper1: { position: 'absolute', top: 0, right: '10%', width: '60%', height: '220px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '4px solid var(--bg-card)', zIndex: 2, transform: 'rotate(2deg)' },
  heroImgWrapper2: { position: 'absolute', bottom: 0, left: '5%', width: '65%', height: '200px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '4px solid var(--bg-card)', zIndex: 1, transform: 'rotate(-3deg)' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroImgLabel: { position: 'absolute', bottom: '0.8rem', left: '0.8rem', background: 'rgba(255,255,255,0.9)', color: '#111', fontSize: '0.65rem', fontWeight: '800', padding: '0.4rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em' },
  heroImgLabelDark: { position: 'absolute', bottom: '0.8rem', right: '0.8rem', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '0.4rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em' },

  /* Stats */
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 3rem', position: 'relative', zIndex: 1, background: 'var(--bg-glass)', backdropFilter: 'blur(10px)' },
  statItem: { textAlign: 'center', animation: 'countPop 0.6s ease forwards', opacity: 0 },
  statNum: { display: 'block', fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '900', color: 'var(--accent)', fontStyle: 'italic', marginBottom: '0.2rem' },
  statLabel: { fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' },

  /* Actions */
  actionsSection: { padding: '4rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' },
  sectionTag: { color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.8rem' },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '2.5rem', color: 'var(--text-primary)' },

  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  actionCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.8rem 1.4rem', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', animation: 'staggerUp 0.6s ease forwards', opacity: 0 },
  actionHighlight: { borderColor: 'var(--accent)', transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(230,57,70,0.15), 0 0 0 1px var(--accent)' },
  actionIconWrap: { width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' },
  actionIcon: { fontSize: '1.3rem' },
  actionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' },
  actionDesc: { color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6' },

  /* Recommended */
  recSection: { padding: '2rem 3rem 4rem', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' },

  recGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  shimmerCard: { height: '180px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },

  emptyRec: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' },
  emptySub: { color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' },

  recCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.3rem', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'staggerUp 0.5s ease forwards', opacity: 0 },
  recRoute: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' },
  recDotGreen: { color: 'var(--green)', fontSize: '0.6rem' },
  recDotRed: { color: 'var(--accent)', fontSize: '0.6rem' },
  recRouteText: { fontSize: '0.82rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recMeta: { display: 'flex', gap: '0.4rem', marginBottom: '0.7rem', marginTop: '0.4rem' },
  recChip: { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '99px' },
  recDriver: { display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.7rem', borderTop: '1px solid var(--border)' },
  recAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700' },
  recDriverName: { color: 'var(--text-secondary)', fontSize: '0.8rem', flex: 1 },
  recArrow: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem' },

  /* Info */
  infoBar: { margin: '0 3rem 3rem', background: 'var(--accent-soft)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 'var(--radius-md)', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease 1s forwards', opacity: 0 },
  infoIcon: { fontSize: '1.3rem' },
  infoText: { color: 'var(--text-secondary)', fontSize: '0.88rem' },

  /* Fleet Section */
  fleetSection: { padding: '2rem 3rem 4rem', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' },
  fleetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' },
  fleetCard: { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', ':hover': { transform: 'translateY(-5px)', boxShadow: 'var(--shadow-card-hover)' } },
  fleetImgWrap: { position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' },
  fleetImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  badgeLuxury: { position: 'absolute', top: '1rem', right: '1rem', background: '#000', color: '#d4af37', fontSize: '0.65rem', fontWeight: '800', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid #d4af37', letterSpacing: '0.1em' },
  badgePremium: { position: 'absolute', top: '1rem', right: '1rem', background: '#111', color: '#e2e8f0', fontSize: '0.65rem', fontWeight: '800', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid #475569', letterSpacing: '0.1em' },
  badgeStandard: { position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '0.3rem 0.8rem', borderRadius: '4px', letterSpacing: '0.1em' },
  fleetContent: { padding: '1.5rem' },
  fleetName: { fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-primary)' },
  fleetDesc: { color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' },
  fleetPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' },
  fleetPrice: { fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)' },
  fleetCredits: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' },
  fleetBtn: { background: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
};

export default Dashboard;