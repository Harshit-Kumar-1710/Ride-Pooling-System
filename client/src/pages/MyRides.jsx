import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const MyRides = () => {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('offered');
  const [offered, setOffered] = useState([]);
  const [booked, setBooked]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [a, b] = await Promise.all([API.get('/rides/mine'), API.get('/bookings/mine')]);
        setOffered(a.data.rides);
        setBooked(b.data.bookings);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const handleComplete = async (rideId) => {
    try {
      const res = await API.patch(`/rides/${rideId}/complete`);
      setOffered(prev => prev.map(r => r._id === rideId ? { ...r, status: 'completed' } : r));
      setMsg(`Ride completed! You earned ${res.data.creditsAwarded} credits.`);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleCancel = async (rideId) => {
    try {
      await API.patch(`/rides/${rideId}/cancel`);
      setOffered(prev => prev.map(r => r._id === rideId ? { ...r, status: 'cancelled' } : r));
      setMsg('Ride cancelled.');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await API.delete(`/bookings/${bookingId}`);
      setBooked(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      setMsg('Booking cancelled.');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const statusStyle = (status) => {
    const map = {
      open:      { background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)' },
      full:      { background: 'var(--orange-soft)', color: 'var(--orange)', border: '1px solid var(--orange)' },
      completed: { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' },
      cancelled: { background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)' },
      confirmed: { background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)' },
    };
    return map[status] || {};
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }} />
      Loading your rides...
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
          <h2 style={styles.title}>My Rides</h2>
        </div>

        {msg && (
          <div style={styles.msgBox}>
            {msg}
            <button style={styles.msgClose} onClick={() => setMsg('')}>✕</button>
          </div>
        )}

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'offered' ? styles.tabActive : {}) }}
            onClick={() => setTab('offered')}>
            🚗 Rides I Offered ({offered.length})
          </button>
          <button style={{ ...styles.tab, ...(tab === 'booked' ? styles.tabActive : {}) }}
            onClick={() => setTab('booked')}>
            🎫 Rides I Booked ({booked.length})
          </button>
        </div>

        {tab === 'offered' && (
          <div style={styles.list}>
            {offered.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🚗</div>
                <p style={styles.emptyText}>No rides offered yet</p>
                <button style={styles.emptyBtn} onClick={() => navigate('/offer-ride')}>Offer a Ride</button>
              </div>
            ) : offered.map((ride, i) => (
              <div key={ride._id} style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={styles.cardTop}>
                  <p style={styles.route}>{ride.origin.label} → {ride.destination.label}</p>
                  <span style={{ ...styles.badge, ...statusStyle(ride.status) }}>{ride.status}</span>
                </div>
                <div style={styles.meta}>
                  <span style={styles.chip}>🕐 {formatTime(ride.departureTime)}</span>
                  <span style={styles.chip}>💺 {ride.seatsAvailable}/{ride.seatsTotal} seats</span>
                </div>
                {(ride.status === 'open' || ride.status === 'full') && (
                  <div style={styles.btnRow}>
                    <button style={styles.completeBtn} onClick={() => handleComplete(ride._id)}>✓ Complete</button>
                    <button style={styles.trackBtn} onClick={() => navigate(`/track/${ride._id}`)}>Track</button>
                    <button style={styles.cancelBtn} onClick={() => handleCancel(ride._id)}>Cancel</button>
                  </div>
                )}
                {ride.status === 'completed' && (
                  <button style={styles.rateBtn} onClick={() => navigate(`/review/${ride._id}`)}>⭐ Rate Passengers</button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'booked' && (
          <div style={styles.list}>
            {booked.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🎫</div>
                <p style={styles.emptyText}>No rides booked yet</p>
                <button style={styles.emptyBtn} onClick={() => navigate('/find-ride')}>Find a Ride</button>
              </div>
            ) : booked.map((booking, i) => (
              <div key={booking._id} style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={styles.cardTop}>
                  <p style={styles.route}>{booking.rideId?.origin?.label} → {booking.rideId?.destination?.label}</p>
                  <span style={{ ...styles.badge, ...statusStyle(booking.status) }}>{booking.status}</span>
                </div>
                <div style={styles.meta}>
                  <span style={styles.chip}>📍 Pickup: {booking.pickupPoint?.label}</span>
                  <span style={styles.chip}>📍 Drop: {booking.dropPoint?.label}</span>
                </div>
                {booking.status === 'confirmed' && (
                  <div style={styles.btnRow}>
                    <button style={styles.trackBtn} onClick={() => navigate(`/track/${booking.rideId?._id}`)}>💬 Track & Chat</button>
                    <button style={styles.cancelBtn} onClick={() => handleCancelBooking(booking._id)}>Cancel</button>
                  </div>
                )}
                {booking.rideId?.status === 'completed' && (
                  <button style={styles.rateBtn} onClick={() => navigate(`/review/${booking.rideId?._id}`)}>⭐ Rate Driver</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:   { maxWidth: '740px', margin: '0 auto', animation: 'fadeIn 0.4s ease' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' },
  title:       { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' },
  msgBox:      { background: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.3s ease' },
  msgClose:    { background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '1rem' },
  tabs:        { display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px', gap: '4px', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },
  tab:         { flex: 1, padding: '0.65rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500', transition: 'all 0.25s ease' },
  tabActive:   { background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: '600' },
  list:        { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  card:        { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem', transition: 'all 0.3s ease', animation: 'fadeInUp 0.4s ease forwards', opacity: 0 },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' },
  route:       { fontWeight: '600', fontSize: '0.93rem', flex: 1, marginRight: '0.8rem' },
  badge:       { fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '99px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' },
  meta:        { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' },
  chip:        { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '99px' },
  btnRow:      { display: 'flex', gap: '0.7rem' },
  completeBtn: { flex: 1, padding: '0.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: '600' },
  cancelBtn:   { flex: 1, padding: '0.6rem', background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.83rem' },
  trackBtn:    { flex: 1, padding: '0.6rem', background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.83rem' },
  rateBtn:     { width: '100%', padding: '0.6rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: '600', marginTop: '0.5rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' },
  empty:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', animation: 'fadeInUp 0.5s ease' },
  emptyIcon:   { fontSize: '2.5rem', marginBottom: '0.8rem' },
  emptyText:   { color: 'var(--text-secondary)', marginBottom: '1rem' },
  emptyBtn:    { padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)' },
};

export default MyRides;