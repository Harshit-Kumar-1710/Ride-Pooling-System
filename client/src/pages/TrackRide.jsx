import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LiveMap from '../components/LiveMap';
import LiveTracker from '../components/LiveTracker';
import API from '../services/api';

const TrackRide = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [ride, setRide]     = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideRes = await API.get(`/rides/${id}`);
        const r = rideRes.data.ride;
        setRide(r);
        setIsDriver(r.driverId._id === user._id || r.driverId === user._id);

        const bookRes = await API.get('/bookings/mine');
        const myBooking = bookRes.data.bookings.find(b => b.rideId?._id === id || b.rideId === id);
        setBooking(myBooking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!ride)   return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ride not found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/my-rides')}>← Back</button>
          <h2 style={styles.title}>
            {isDriver ? '🚗 You are driving' : '🎫 Your ride'}
          </h2>
          <span style={{ ...styles.badge, background: ride.status === 'open' ? 'var(--green-soft)' : 'var(--accent-soft)', color: ride.status === 'open' ? 'var(--green)' : 'var(--accent)', border: `1px solid ${ride.status === 'open' ? 'var(--green)' : 'var(--accent)'}` }}>
            {ride.status}
          </span>
        </div>

        <div style={styles.grid}>
          <div style={styles.leftPanel}>
            <div style={styles.card}>
              <p style={styles.sectionLabel}>Route</p>
              <p style={styles.routeText}>{ride.origin.label}</p>
              <p style={styles.routeArrow}>↓</p>
              <p style={styles.routeText}>{ride.destination.label}</p>
            </div>

            <div style={styles.card}>
              <p style={styles.sectionLabel}>Driver</p>
              <div style={styles.driverRow}>
                <div style={styles.avatar}>{ride.driverId?.name?.charAt(0)}</div>
                <div>
                  <p style={styles.driverName}>{ride.driverId?.name}</p>
                  <p style={styles.driverId}>{ride.driverId?.collegeId}</p>
                </div>
              </div>
            </div>

            {isDriver && (
              <LiveTracker rideId={id} userId={user._id} />
            )}

            {!isDriver && booking && (
              <div style={styles.card}>
                <p style={styles.sectionLabel}>Your booking</p>
                <p style={styles.infoText}>📍 Pickup: {booking.pickupPoint?.label}</p>
                <p style={styles.infoText}>📍 Drop: {booking.dropPoint?.label}</p>
                <p style={{ ...styles.infoText, color: booking.status === 'confirmed' ? 'var(--green)' : 'var(--red)', marginTop: '0.5rem' }}>
                  Status: {booking.status}
                </p>
              </div>
            )}
          </div>

          <div>
            <LiveMap rideId={id} ride={ride} height="500px" />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:       { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:  { maxWidth: '1100px', margin: '0 auto' },
  header:     { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn:    { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  title:      { fontSize: '1.4rem', fontWeight: '700', flex: 1 },
  badge:      { fontSize: '0.78rem', fontWeight: '600', padding: '3px 12px', borderRadius: '99px' },
  grid:       { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' },
  leftPanel:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem' },
  sectionLabel:{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' },
  routeText:  { fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' },
  routeArrow: { color: 'var(--text-muted)', margin: '0.3rem 0' },
  driverRow:  { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  avatar:     { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 },
  driverName: { fontWeight: '600', fontSize: '0.9rem' },
  driverId:   { color: 'var(--text-muted)', fontSize: '0.8rem' },
  infoText:   { color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }
};

export default TrackRide;