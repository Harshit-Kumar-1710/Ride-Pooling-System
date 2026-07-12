import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import MovingCars from '../components/MovingCars';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ offered: 0, booked: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, ridesRes, bookingsRes] = await Promise.all([
          API.get(`/reviews/user/${user._id}`),
          API.get('/rides/mine'),
          API.get('/bookings/mine'),
        ]);
        setReviews(reviewRes.data.reviews || []);
        setStats({
          offered: ridesRes.data.rides?.length || 0,
          booked: bookingsRes.data.bookings?.length || 0,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user?._id) fetchData();
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }} />
      Loading profile...
    </div>
  );

  return (
    <div style={styles.page}>
      <MovingCars count={6} />
      <div style={styles.container}>

        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>

        {/* Hero card */}
        <div style={styles.heroCard}>
          <div style={styles.avatarRing}>
            <div style={styles.avatar}>{user?.name?.charAt(0)}</div>
          </div>
          <h1 style={styles.name}>{user?.name}</h1>
          <p style={styles.collegeId}>{user?.collegeId} · GEU Verified ✓</p>
          <p style={styles.email}>{user?.personalEmail}</p>
          <p style={styles.memberSince}>Member since {memberSince}</p>

          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{stats.offered}</span>
              <span style={styles.statLabel}>Rides Offered</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBox}>
              <span style={styles.statNum}>{stats.booked}</span>
              <span style={styles.statLabel}>Rides Booked</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: '#f59e0b' }}>
                {user?.totalRidesOffered > 0 ? `${user?.rating || 'N/A'} ⭐` : 'N/A'}
              </span>
              <span style={styles.statLabel}>Rating</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: 'var(--green)' }}>⚡ {user?.credits || 0}</span>
              <span style={styles.statLabel}>Credits</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={styles.badgesCard}>
          <h3 style={styles.sectionTitle}>🏆 Achievements</h3>
          <div style={styles.badgesGrid}>
            <div style={{ ...styles.badge, ...(stats.offered >= 1 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>🚗</span>
              <span style={styles.badgeLabel}>First Ride</span>
            </div>
            <div style={{ ...styles.badge, ...(stats.offered >= 5 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>🌟</span>
              <span style={styles.badgeLabel}>5 Rides</span>
            </div>
            <div style={{ ...styles.badge, ...(stats.offered >= 10 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>🏅</span>
              <span style={styles.badgeLabel}>10 Rides</span>
            </div>
            <div style={{ ...styles.badge, ...((user?.rating || 0) >= 4.5 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>💎</span>
              <span style={styles.badgeLabel}>Top Rated</span>
            </div>
            <div style={{ ...styles.badge, ...(stats.booked >= 1 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>🎫</span>
              <span style={styles.badgeLabel}>First Booking</span>
            </div>
            <div style={{ ...styles.badge, ...((user?.credits || 0) >= 10 ? {} : styles.lockedBadge) }}>
              <span style={styles.badgeIcon}>⚡</span>
              <span style={styles.badgeLabel}>10 Credits</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={styles.reviewsCard}>
          <h3 style={styles.sectionTitle}>⭐ Reviews Received ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={styles.emptyText}>No reviews yet. Complete rides to get reviews!</p>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.slice(0, 5).map((r, i) => (
                <div key={r._id || i} style={styles.reviewItem}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewAvatar}>{r.fromUserId?.name?.charAt(0)}</div>
                    <div>
                      <p style={styles.reviewerName}>{r.fromUserId?.name}</p>
                      <p style={styles.reviewDate}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span style={styles.reviewStars}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && <p style={styles.reviewComment}>"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem', position: 'relative' },
  container: { maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeIn 0.4s ease' },
  backBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'all 0.2s' },

  heroCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 2rem 2rem', textAlign: 'center', marginBottom: '1rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0, position: 'relative', overflow: 'hidden' },
  avatarRing: { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #f59e0b, var(--green))', padding: '3px', margin: '0 auto 1rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" },
  name: { fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.2rem', animation: 'fadeInUp 0.5s ease 0.15s forwards', opacity: 0 },
  collegeId: { color: 'var(--green)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.2rem', animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  email: { color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.2rem', animation: 'fadeInUp 0.5s ease 0.25s forwards', opacity: 0 },
  memberSince: { color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.3s forwards', opacity: 0 },

  statsRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', animation: 'fadeInUp 0.5s ease 0.35s forwards', opacity: 0 },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0.8rem' },
  statNum: { fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)', fontFamily: "'Outfit', sans-serif" },
  statLabel: { fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' },
  statDivider: { width: '1px', height: '32px', background: 'var(--border)' },

  badgesCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem', animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' },
  badgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' },
  badge: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 0.5rem', textAlign: 'center', transition: 'all 0.3s ease' },
  lockedBadge: { opacity: 0.6, filter: 'grayscale(100%)', background: 'var(--bg-primary)' },
  badgeIcon: { display: 'block', fontSize: '1.8rem', marginBottom: '0.3rem' },
  badgeLabel: { fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)' },

  reviewsCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.3s forwards', opacity: 0 },
  emptyText: { color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  reviewItem: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.9rem' },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  reviewAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 },
  reviewerName: { fontWeight: '600', fontSize: '0.85rem' },
  reviewDate: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  reviewStars: { marginLeft: 'auto', color: '#f59e0b', fontSize: '0.9rem', letterSpacing: '1px' },
  reviewComment: { color: 'var(--text-secondary)', fontSize: '0.82rem', fontStyle: 'italic', marginTop: '0.5rem', paddingLeft: '2.4rem' },
};

export default Profile;
