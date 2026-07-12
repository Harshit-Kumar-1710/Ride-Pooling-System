import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import MovingCars from '../components/MovingCars';
import AnimatedStats from '../components/AnimatedStats';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div style={styles.page}>
      <MovingCars count={8} />

      {/* ── Nav Bar ── */}
      <nav style={styles.nav}>
        <span style={styles.brand}>
          <span style={styles.brandRed}>RIDEPOOL</span> <span style={{ color: 'var(--text-primary)' }}>GEU</span>
        </span>
        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {theme === 'dark' ? <Sun size={20} color="#e63946" /> : <Moon size={20} color="#e63946" />}
          </button>
          <button style={styles.signInBtn} onClick={() => navigate('/login')}>SIGN IN</button>
          <button style={styles.signUpBtn} onClick={() => navigate('/register')}>SIGN UP</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroTag}>
            <span style={styles.heroDash}>——</span> PREMIUM COLLEGE RIDES
          </p>
          <h1 style={styles.heroTitle}>
            RIDE<br />
            <span style={styles.heroItalic}>TOGETHER.</span><br />
            GO FURTHER.
          </h1>
          <p style={styles.heroSub}>
            Share rides with fellow GEU students in premium comfort. Save money, earn credits,
            and travel safe — all in one place.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.ctaPrimary} onClick={() => navigate('/register')}>
              FIND A RIDE →
            </button>
            <button style={styles.ctaOutline} onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              HOW IT WORKS
            </button>
          </div>
          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            <span style={styles.liveText}>Live on GEU Campus</span>
          </div>
        </div>

        {/* ── Right Side: Luxury Car Collage ── */}
        <div style={styles.heroImages}>
          <img 
            src="https://images.unsplash.com/photo-1549317336-206569e8475c?auto=format&fit=crop&q=80&w=600" 
            alt="Happy friends in ride" 
            style={{...styles.heroImg, ...styles.img1}} 
          />
          <img 
            src="https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?auto=format&fit=crop&q=80&w=600" 
            alt="Premium Interior" 
            style={{...styles.heroImg, ...styles.img2}} 
          />
          <div style={styles.uberBadge}>
            <span style={styles.uberBadgeDot}></span> Premium Rides
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <AnimatedStats styleLayout="landing" />

      {/* ── Why Section ── */}
      <section id="features" style={styles.whySection}>
        <p style={styles.whyTag}>
          <span style={styles.heroDash}>——</span> WHY RIDEPOOL GEU
        </p>
        <h2 style={styles.whyTitle}>
          BUILT FOR <span style={styles.heroItalic}>REAL</span><br />STUDENTS
        </h2>
        <p style={styles.whySub}>
          No more scattered WhatsApp groups, missed rides, or last-minute
          cancellations. Everything you need to ride together — in one place.
        </p>

        <div style={styles.featureGrid}>
          {[
            { icon: '🔍', title: 'Discover Rides', desc: 'Search by route, time, and seats. Find the perfect ride for your commute.' },
            { icon: '🧠', title: 'Smart Search', desc: 'Type "GEU to ISBT tomorrow 9am" — our NLP parser fills everything instantly.' },
            { icon: '💬', title: 'Group Chat', desc: 'Real-time chat with your ride group. Coordinate pickups, no DMs to strangers.' },
            { icon: '⚡', title: 'Credits & Ratings', desc: 'Earn credits for offering rides. Rate each other to build campus trust.' },
          ].map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                ...styles.featureCard,
                ...(hoveredFeature === i ? styles.featureHighlight : {}),
                animationDelay: `${0.2 + i * 0.12}s`,
              }}
            >
              <div style={{
                ...styles.featureIconWrap,
                ...(hoveredFeature === i ? { background: 'var(--accent)', boxShadow: '0 4px 20px rgba(230,57,70,0.4)' } : {})
              }}>
                <span style={styles.featureIcon}>{f.icon}</span>
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Amazon/Flipkart Style Fleet Section ── */}
      <section style={styles.fleetSection}>
        <div style={styles.fleetHeader}>
          <h2 style={styles.fleetTitle}>OUR PREMIUM <span style={styles.heroItalic}>FLEET</span></h2>
          <p style={styles.fleetSub}>Verified vehicles. Professional drivers. Arrive in style.</p>
        </div>
        
        <div style={styles.fleetGrid}>
          {/* Luxury Tier */}
          <div style={styles.fleetCard}>
            <div style={styles.fleetImgWrap}>
              <img src="/ferrari.png" alt="Luxury Sports Car" style={styles.fleetImg} />
              <span style={styles.badgeLuxury}>LUXURY</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Supercar Selection</h3>
              <p style={styles.fleetDesc}>For special occasions. Arrive like a VIP.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>500 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn} onClick={() => navigate('/register')}>Book Now</button>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div style={styles.fleetCard}>
            <div style={styles.fleetImgWrap}>
              <img src="/audi.png" alt="Premium Sedan" style={styles.fleetImg} />
              <span style={styles.badgePremium}>PREMIUM</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Executive Sedans</h3>
              <p style={styles.fleetDesc}>Quiet, comfortable, perfect for studying on the go.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>100 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn} onClick={() => navigate('/register')}>Book Now</button>
              </div>
            </div>
          </div>

          {/* Standard Tier */}
          <div style={styles.fleetCard}>
            <div style={styles.fleetImgWrap}>
              <img src="/cab.png" alt="Standard Cab" style={styles.fleetImg} />
              <span style={styles.badgeStandard}>STANDARD</span>
            </div>
            <div style={styles.fleetContent}>
              <h3 style={styles.fleetName}>Everyday Commute</h3>
              <p style={styles.fleetDesc}>Reliable, clean cabs for your daily campus trips.</p>
              <div style={styles.fleetPriceRow}>
                <span style={styles.fleetPrice}>20 <span style={styles.fleetCredits}>credits/km</span></span>
                <button style={styles.fleetBtn} onClick={() => navigate('/register')}>Book Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* Amazon-style Trust Banner */}
        <div style={styles.trustBanner}>
          <div style={styles.trustItem}>🛡️ 100% College Verified</div>
          <div style={styles.trustItem}>📍 Live GPS Tracking</div>
          <div style={styles.trustItem}>⭐ 4.8/5 Average Rating</div>
          <div style={styles.trustItem}>🔒 Secure Credit System</div>
        </div>
      </section>

      {/* ── CTA Split ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaLeft}>
          <div style={styles.ctaTag}>FOR STUDENTS</div>
          <div style={styles.ctaCarGrid}>
            {/* Large car SVG illustration */}
            <svg viewBox="0 0 300 100" style={{ width: '100%', opacity: 0.9 }}>
              <path d="M30 70 C30 70, 40 35, 70 30 L140 25 C155 25, 180 22, 200 30 L250 40 C265 43, 280 52, 280 62 L280 75 L30 75 Z" fill="#e63946" opacity="0.85"/>
              <path d="M80 30 C80 30, 85 12, 120 10 L165 10 C190 10, 200 18, 205 30" fill="#e63946" opacity="0.65"/>
              <rect x="90" y="12" width="35" height="16" rx="2" fill="#4fc3f7" opacity="0.4"/>
              <rect x="135" y="12" width="40" height="16" rx="2" fill="#4fc3f7" opacity="0.35"/>
              <rect x="180" y="14" width="20" height="14" rx="2" fill="#4fc3f7" opacity="0.3"/>
              <circle cx="70" cy="78" r="14" fill="#0a0a12"/>
              <circle cx="70" cy="78" r="7" fill="#1a1a2e"/>
              <circle cx="240" cy="78" r="14" fill="#0a0a12"/>
              <circle cx="240" cy="78" r="7" fill="#1a1a2e"/>
              <rect x="262" y="48" width="18" height="8" rx="2" fill="#fbbf24" opacity="0.6"/>
              <rect x="30" y="55" width="14" height="5" rx="1.5" fill="#fbbf24" opacity="0.7"/>
            </svg>
          </div>
        </div>
        <div style={styles.ctaRight}>
          <p style={styles.ctaRightTag}>FOR RIDERS</p>
          <h2 style={styles.ctaRightTitle}>
            FIND YOUR <span style={styles.heroItalic}>PACK.</span>
          </h2>
          <p style={styles.ctaRightSub}>
            Whether you commute from Rajpur Road or Clement Town, RidePool
            surfaces rides that fit you — not random ones.
          </p>
          <div style={styles.ctaBullets}>
            {[
              'Browse rides by route, time, and available seats',
              'See driver ratings and ride history at a glance',
              'Coordinate via the ride\'s group chat',
              'Track upcoming rides and your community',
            ].map((b, i) => (
              <div key={i} style={styles.ctaBullet}>
                <span style={styles.bulletArrow}>→</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <button style={styles.ctaJoinBtn} onClick={() => navigate('/register')}>
            JOIN AS A RIDER →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span style={styles.footerBrand}>
          <span style={styles.brandRed}>RIDEPOOL</span> GEU
        </span>
        <span style={styles.footerText}>© 2026 · Graphic Era University, Dehradun</span>
      </footer>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' },

  /* Nav */
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 3rem', position: 'relative', zIndex: 10, animation: 'fadeIn 0.6s ease' },
  brand: { fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.08em', color: '#fff' },
  brandRed: { color: 'var(--accent)' },
  navRight: { display: 'flex', gap: '1.2rem', alignItems: 'center' },
  themeToggle: { background: 'transparent', border: '1px solid var(--border)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: 0 },
  signInBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.06em', cursor: 'pointer', padding: '0.5rem 0' },
  signUpBtn: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '0 4px 20px rgba(230,57,70,0.4)' },

  /* Hero */
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6rem 3rem 4rem', position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto', gap: '2rem' },
  heroContent: { animation: 'slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0, flex: '1', maxWidth: '550px' },
  heroTag: { color: 'var(--accent)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  heroDash: { color: 'var(--accent)', marginRight: '0.6rem' },
  heroTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: '900', lineHeight: '0.95', letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '1.8rem' },
  heroItalic: { color: 'var(--accent)', fontStyle: 'italic' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '500px', marginBottom: '2.5rem' },
  heroBtns: { display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' },
  ctaPrimary: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.85rem 2.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '0 4px 24px rgba(230,57,70,0.4)' },
  ctaOutline: { background: 'transparent', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', padding: '0.85rem 2.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.06em', cursor: 'pointer' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite', boxShadow: '0 0 10px rgba(230,57,70,0.5)' },
  liveText: { color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' },

  /* Hero Images Collage */
  heroImages: { flex: '1', position: 'relative', height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 1s ease 0.3s forwards', opacity: 0 },
  heroImg: { position: 'absolute', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  img1: { width: '300px', height: '380px', right: '40px', top: '10px', zIndex: 2, border: '4px solid var(--bg-primary)' },
  img2: { width: '260px', height: '240px', left: '10px', bottom: '20px', zIndex: 3, border: '4px solid var(--bg-primary)' },
  uberBadge: { position: 'absolute', bottom: '80px', right: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', backdropFilter: 'blur(10px)' },
  uberBadgeDot: { width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%' },

  /* Stats */
  statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2.5rem 3rem', position: 'relative', zIndex: 1, background: 'var(--bg-glass)', backdropFilter: 'blur(10px)' },
  statItem: { textAlign: 'center', animation: 'countPop 0.6s ease forwards', opacity: 0 },
  statNum: { display: 'block', fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: 'var(--accent)', fontStyle: 'italic', marginBottom: '0.3rem' },
  statLabel: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' },

  /* Why */
  whySection: { padding: '6rem 3rem', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' },
  whyTag: { color: 'var(--accent)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.2rem' },
  whyTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.03em', marginBottom: '1.2rem' },
  whySub: { color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', maxWidth: '520px', marginBottom: '3rem' },

  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  featureCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.8rem 1.4rem', transition: 'all 0.35s ease', cursor: 'default', animation: 'staggerUp 0.6s ease forwards', opacity: 0 },
  featureHighlight: { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent), 0 8px 32px rgba(230,57,70,0.15)' },
  featureIconWrap: { width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' },
  featureIcon: { fontSize: '1.3rem' },
  featureTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem' },
  featureDesc: { color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6' },

  /* CTA Split */
  ctaSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px', position: 'relative', zIndex: 1 },
  ctaLeft: { background: 'var(--bg-secondary)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  ctaTag: { position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--accent)', color: '#fff', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.08em', padding: '0.3rem 0.8rem', borderRadius: '4px' },
  ctaCarGrid: { width: '85%', maxWidth: '350px' },
  ctaRight: { padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  ctaRightTag: { color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', marginBottom: '0.8rem' },
  ctaRightTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '1.2rem', color: 'var(--text-primary)' },
  ctaRightSub: { color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '420px' },
  ctaBullets: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2rem' },
  ctaBullet: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.85rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.88rem' },
  bulletArrow: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  ctaJoinBtn: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.9rem 2.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.06em', cursor: 'pointer', alignSelf: 'flex-start', boxShadow: '0 4px 24px rgba(230,57,70,0.4)' },

  /* Footer */
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1, background: 'var(--bg-primary)' },
  footerBrand: { fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-primary)' },
  footerText: { color: 'var(--text-muted)', fontSize: '0.78rem' },

  /* Fleet Section */
  fleetSection: { padding: '6rem 3rem', background: 'var(--bg-secondary)', position: 'relative', zIndex: 1 },
  fleetHeader: { textAlign: 'center', marginBottom: '3.5rem' },
  fleetTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.5rem', color: 'var(--text-primary)' },
  fleetSub: { color: 'var(--text-secondary)', fontSize: '1rem' },
  fleetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '4rem' },
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

  trustBanner: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', maxWidth: '1000px', margin: '0 auto', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' },
};

export default LandingPage;
