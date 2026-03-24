import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const MyRides = () => {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('offered');
  const [offered, setOffered]   = useState([]);
  const [booked, setBooked]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [offeredRes, bookedRes] = await Promise.all([
          API.get('/rides/mine'),
          API.get('/bookings/mine')
        ]);
        setOffered(offeredRes.data.rides);
        setBooked(bookedRes.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const handleCancel = async (rideId) => {
    try {
      await API.patch(`/rides/${rideId}/cancel`);
      setOffered(prev => prev.map(r =>
        r._id === rideId ? { ...r, status: 'cancelled' } : r
      ));
      setMsg('Ride cancelled.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Cancel failed.');
    }
  };

  const handleComplete = async (rideId) => {
    try {
      const res = await API.patch(`/rides/${rideId}/complete`);
      setOffered(prev => prev.map(r =>
        r._id === rideId ? { ...r, status: 'completed' } : r
      ));
      setMsg(`Ride completed! You earned ${res.data.creditsAwarded} credits.`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Complete failed.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await API.delete(`/bookings/${bookingId}`);
      setBooked(prev => prev.map(b =>
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      setMsg('Booking cancelled.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Cancel failed.');
    }
  };

  const statusColor = (status) => {
    if (status === 'open')      return '#27AE60';
    if (status === 'full')      return '#E67E22';
    if (status === 'completed') return '#2980B9';
    if (status === 'cancelled') return '#E74C3C';
    if (status === 'confirmed') return '#27AE60';
    return '#888';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Rides</h2>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>

      {msg && <div style={styles.msg}>{msg}</div>}

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'offered' ? styles.activeTab : {}) }}
          onClick={() => setTab('offered')}>
          Rides I Offered ({offered.length})
        </button>
        <button style={{ ...styles.tab, ...(tab === 'booked' ? styles.activeTab : {}) }}
          onClick={() => setTab('booked')}>
          Rides I Booked ({booked.length})
        </button>
      </div>

      {tab === 'offered' && (
        <div>
          {offered.length === 0 ? (
            <div style={styles.empty}>You haven't offered any rides yet.</div>
          ) : offered.map(ride => (
            <div key={ride._id} style={styles.card}>
              <div style={styles.cardTop}>
                <p style={styles.route}>{ride.origin.label} → {ride.destination.label}</p>
                <span style={{ ...styles.statusBadge, background: statusColor(ride.status) }}>
                  {ride.status}
                </span>
              </div>
              <p style={styles.info}>🕐 {formatTime(ride.departureTime)}</p>
              <p style={styles.info}>💺 {ride.seatsAvailable} seats remaining</p>
              {ride.status === 'open' || ride.status === 'full' ? (
                <div style={styles.btnRow}>
                  <button style={styles.completeBtn}
                    onClick={() => handleComplete(ride._id)}>
                    Mark Complete
                  </button>
                  <button style={styles.cancelBtn}
                    onClick={() => handleCancel(ride._id)}>
                    Cancel Ride
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {tab === 'booked' && (
        <div>
          {booked.length === 0 ? (
            <div style={styles.empty}>You haven't booked any rides yet.</div>
          ) : booked.map(booking => (
            <div key={booking._id} style={styles.card}>
              <div style={styles.cardTop}>
                <p style={styles.route}>
                  {booking.rideId?.origin?.label} → {booking.rideId?.destination?.label}
                </p>
                <span style={{ ...styles.statusBadge, background: statusColor(booking.status) }}>
                  {booking.status}
                </span>
              </div>
              <p style={styles.info}>📍 Pickup: {booking.pickupPoint.label}</p>
              <p style={styles.info}>📍 Drop: {booking.dropPoint.label}</p>
              {booking.status === 'confirmed' && (
                <button style={styles.cancelBtn}
                  onClick={() => handleCancelBooking(booking._id)}>
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container:   { maxWidth: '580px', margin: '0 auto', padding: '2rem 1rem', minHeight: '100vh' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' },
  title:       { color: '#1E3A5F', margin: 0 },
  back:        { background: 'transparent', border: '1px solid #1E3A5F', color: '#1E3A5F', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' },
  msg:         { background: '#E8F5E9', color: '#2E7D32', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  tabs:        { display: 'flex', gap: '0', marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1E3A5F' },
  tab:         { flex: 1, padding: '10px', background: '#fff', color: '#1E3A5F', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
  activeTab:   { background: '#1E3A5F', color: '#fff' },
  card:        { background: '#fff', borderRadius: '12px', padding: '1.2rem 1.5rem', marginBottom: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
  route:       { fontWeight: '600', color: '#1E3A5F', fontSize: '0.95rem', margin: 0 },
  statusBadge: { color: '#fff', fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  info:        { color: '#666', fontSize: '0.85rem', margin: '0.2rem 0' },
  btnRow:      { display: 'flex', gap: '0.8rem', marginTop: '0.8rem' },
  completeBtn: { flex: 1, padding: '8px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtn:   { flex: 1, padding: '8px', background: '#fdecea', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.8rem' },
  empty:       { background: '#fff', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#888' }
};

export default MyRides;