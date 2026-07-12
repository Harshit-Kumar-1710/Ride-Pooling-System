import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LiveMap from '../components/LiveMap';
import LiveTracker from '../components/LiveTracker';
import RideChat from '../components/RideChat';
import API from '../services/api';

const TrackRide = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [ride, setRide]       = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDriver, setIsDriver] = useState(false);
  const [optimized, setOptimized] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

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

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }} />
      Loading ride...
    </div>
  );

  if (!ride) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ride not found.</div>;

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
            <div style={{ ...styles.card, animationDelay: '0.1s' }}>
              <p style={styles.sectionLabel}>Route</p>
              <p style={styles.routeText}>{ride.origin.label}</p>
              <p style={styles.routeArrow}>↓</p>
              <p style={styles.routeText}>{ride.destination.label}</p>
            </div>

            <div style={{ ...styles.card, animationDelay: '0.2s' }}>
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
              <div style={{ ...styles.card, animationDelay: '0.3s' }}>
                <p style={styles.sectionLabel}>Your booking</p>
                <p style={styles.infoText}>📍 Pickup: {booking.pickupPoint?.label}</p>
                <p style={styles.infoText}>📍 Drop: {booking.dropPoint?.label}</p>
                <p style={{ ...styles.infoText, color: booking.status === 'confirmed' ? 'var(--green)' : 'var(--red)', marginTop: '0.5rem', fontWeight: '600' }}>
                  Status: {booking.status}
                </p>
              </div>
            )}

            {isDriver && (
              <div style={{ ...styles.card, animationDelay: '0.4s' }}>
                <p style={styles.sectionLabel}>Route Optimization</p>
                <button
                  style={styles.optimizeBtn}
                  onClick={async () => {
                    setOptimizing(true);
                    try {
                      const res = await API.get(`/rides/${id}/optimize`);
                      setOptimized(res.data);
                    } catch (err) { console.error(err); }
                    finally { setOptimizing(false); }
                  }}
                  disabled={optimizing}
                >
                  {optimizing ? 'Optimizing...' : '🗺️ Optimize Pickup Order'}
                </button>
                {optimized && optimized.optimized?.length > 0 && (
                  <div style={styles.optimizedList}>
                    <div style={styles.stopItem}>
                      <span style={{ ...styles.stopNum, background: 'var(--green)' }}>S</span>
                      <span style={styles.stopText}>{optimized.origin?.label}</span>
                    </div>
                    {optimized.optimized.map((stop, i) => (
                      <div key={i} style={styles.stopItem}>
                        <span style={{ ...styles.stopNum, background: stop.type === 'pickup' ? 'var(--accent)' : 'var(--orange)' }}>{i + 1}</span>
                        <div>
                          <span style={styles.stopText}>{stop.label}</span>
                          <span style={styles.stopMeta}>{stop.type === 'pickup' ? '⬆ Pick' : '⬇ Drop'} • {stop.passenger}</span>
                        </div>
                      </div>
                    ))}
                    <div style={styles.stopItem}>
                      <span style={{ ...styles.stopNum, background: 'var(--green)' }}>E</span>
                      <span style={styles.stopText}>{optimized.destination?.label}</span>
                    </div>
                  </div>
                )}
                {optimized && optimized.optimized?.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem' }}>No bookings to optimize yet.</p>
                )}
              </div>
            )}
          </div>

          <div style={styles.mapWrap}>
            <LiveMap rideId={id} ride={ride} height="500px" />
          </div>
        </div>
      </div>

      {/* Ride Chat */}
      <RideChat rideId={id} />
    </div>
  );
};

const styles = {
  page:       { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:  { maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.4s ease' },
  header:     { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  backBtn:    { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' },
  title:      { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', flex: 1 },
  badge:      { fontSize: '0.75rem', fontWeight: '600', padding: '4px 14px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.03em' },
  grid:       { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' },
  leftPanel:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  mapWrap:    { animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  card:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem', animation: 'fadeInUp 0.4s ease forwards', opacity: 0, transition: 'all 0.3s ease' },
  sectionLabel:{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' },
  routeText:  { fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' },
  routeArrow: { color: 'var(--accent)', margin: '0.3rem 0', fontSize: '1.1rem' },
  driverRow:  { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  avatar:     { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, boxShadow: '0 0 0 2px var(--bg-card), 0 0 0 3px var(--accent)' },
  driverName: { fontWeight: '600', fontSize: '0.9rem' },
  driverId:   { color: 'var(--text-muted)', fontSize: '0.8rem' },
  infoText:   { color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' },
  optimizeBtn: { width: '100%', padding: '0.65rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 2px 10px rgba(230, 57, 70, 0.3)' },
  optimizedList: { marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  stopItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0' },
  stopNum: { width: '24px', height: '24px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0 },
  stopText: { fontSize: '0.82rem', fontWeight: '600' },
  stopMeta: { display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' },
};

export default TrackRide;