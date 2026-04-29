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
      open: { background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)' },
      full: { background: 'var(--orange-soft)', color: 'var(--orange)', border: '1px solid var(--orange)' },
      completed: { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' },
      cancelled: { background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)' },
      confirmed: { background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)' },
    };
    return map[status] || {};
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
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
            ) : offered.map(ride => (
              <div key={ride._id} style={styles.card}>
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
                    <button style={styles.completeBtn} onClick={() => handleComplete(ride._id)}>
                      ✓ Mark Complete
                    </button>
                    <button style={styles.trackBtn} onClick={() => navigate(`/track/${ride._id}`)}>
                      Track
                    </button>
                    <button style={styles.cancelBtn} onClick={() => handleCancel(ride._id)}>
                      Cancel
                    </button>
                  </div>
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
            ) : booked.map(booking => (
              <div key={booking._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <p style={styles.route}>
                    {booking.rideId?.origin?.label} → {booking.rideId?.destination?.label}
                  </p>
                  <span style={{ ...styles.badge, ...statusStyle(booking.status) }}>{booking.status}</span>
                </div>
                <div style={styles.meta}>
                  <span style={styles.chip}>📍 Pickup: {booking.pickupPoint?.label}</span>
                  <span style={styles.chip}>📍 Drop: {booking.dropPoint?.label}</span>
                </div>
                {booking.status === 'confirmed' && (
                  <button style={styles.cancelBtn} onClick={() => handleCancelBooking(booking._id)}>
                    Cancel Booking
                  </button>
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
  container:   { maxWidth: '700px', margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  title:       { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' },
  msgBox:      { background: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  msgClose:    { background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '1rem' },
  tabs:        { display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px', gap: '4px', marginBottom: '1.5rem' },
  tab:         { flex: 1, padding: '0.6rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  tabActive:   { background: 'var(--bg-hover)', color: 'var(--text-primary)' },
  list:        { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  card:        { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' },
  route:       { fontWeight: '600', fontSize: '0.95rem', flex: 1, marginRight: '0.8rem' },
  badge:       { fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '99px', whiteSpace: 'nowrap' },
  meta:        { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' },
  chip:        { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.78rem', padding: '3px 8px', borderRadius: '99px' },
  btnRow:      { display: 'flex', gap: '0.7rem' },
  completeBtn: { flex: 1, padding: '0.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  cancelBtn:   { flex: 1, padding: '0.6rem', background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  empty:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' },
  emptyIcon:   { fontSize: '2.5rem', marginBottom: '0.8rem' },
  emptyText:   { color: 'var(--text-secondary)', marginBottom: '1rem' },
  emptyBtn:    { padding: '0.6rem 1.2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  trackBtn: { flex: 1, padding: '0.6rem', background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }
};

export default MyRides;