import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

const RideDetail = () => {
  const { id }       = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const ride         = state?.ride;
  const form         = state?.form;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [booked, setBooked]   = useState(false);

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/bookings', {
        rideId: id,
        pickupPoint: {
          label:     form?.pickupLabel || 'Pickup',
          latitude:  parseFloat(form?.pickupLat),
          longitude: parseFloat(form?.pickupLng)
        },
        dropPoint: {
          label:     form?.dropLabel || 'Drop',
          latitude:  parseFloat(form?.dropLat),
          longitude: parseFloat(form?.dropLng)
        }
      });
      setBooked(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p>Ride not found. Go back and search again.</p>
        <button style={styles.btn} onClick={() => navigate('/find-ride')}>Back to Search</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {booked ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Ride Booked!</h3>
            <p style={styles.successSub}>Your seat is confirmed. Have a safe trip.</p>
            <button style={styles.btn} onClick={() => navigate('/my-rides')}>
              View My Rides
            </button>
            <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Ride Details</h2>

            <div style={styles.section}>
              <div style={styles.routeRow}>
                <div style={styles.point}>
                  <div style={styles.dot} />
                  <div>
                    <p style={styles.pointLabel}>From</p>
                    <p style={styles.pointName}>{ride.origin.label}</p>
                  </div>
                </div>
                <div style={styles.line} />
                <div style={styles.point}>
                  <div style={{ ...styles.dot, background: '#E74C3C' }} />
                  <div>
                    <p style={styles.pointLabel}>To</p>
                    <p style={styles.pointName}>{ride.destination.label}</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <p style={styles.infoLabel}>Departure</p>
                <p style={styles.infoValue}>{formatTime(ride.departureTime)}</p>
              </div>
              <div style={styles.infoItem}>
                <p style={styles.infoLabel}>Seats available</p>
                <p style={styles.infoValue}>{ride.seatsAvailable} / {ride.seatsTotal}</p>
              </div>
              <div style={styles.infoItem}>
                <p style={styles.infoLabel}>Detour distance</p>
                <p style={styles.infoValue}>{ride.detourDistance} km</p>
              </div>
              <div style={styles.infoItem}>
                <p style={styles.infoLabel}>Driver rating</p>
                <p style={styles.infoValue}>⭐ {ride.driverId.rating} / 5</p>
              </div>
            </div>

            <div style={styles.driverBox}>
              <p style={styles.driverLabel}>Driver</p>
              <p style={styles.driverName}>{ride.driverId.name}</p>
              <p style={styles.driverId}>{ride.driverId.collegeId}</p>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.bookBtn} onClick={handleBook} disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button style={styles.backBtn} onClick={() => navigate('/find-ride')}>
              Back to Search
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:    { minHeight: '100vh', background: '#f0f4f8', padding: '2rem 1rem' },
  card:         { background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '500px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title:        { color: '#1E3A5F', marginBottom: '1.5rem' },
  section:      { marginBottom: '1.5rem' },
  routeRow:     { display: 'flex', alignItems: 'center', gap: '1rem' },
  point:        { display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 },
  dot:          { width: '14px', height: '14px', borderRadius: '50%', background: '#27AE60', flexShrink: 0 },
  line:         { flex: 1, height: '2px', background: '#e0e0e0' },
  pointLabel:   { fontSize: '0.75rem', color: '#999', marginBottom: '2px' },
  pointName:    { fontSize: '0.95rem', fontWeight: '600', color: '#1E3A5F' },
  infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  infoItem:     { background: '#f8f9fa', borderRadius: '8px', padding: '0.8rem' },
  infoLabel:    { fontSize: '0.75rem', color: '#999', marginBottom: '4px' },
  infoValue:    { fontSize: '0.95rem', fontWeight: '600', color: '#333' },
  driverBox:    { background: '#E8EEF5', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' },
  driverLabel:  { fontSize: '0.75rem', color: '#666', marginBottom: '4px' },
  driverName:   { fontSize: '1rem', fontWeight: '600', color: '#1E3A5F' },
  driverId:     { fontSize: '0.85rem', color: '#666' },
  bookBtn:      { width: '100%', padding: '12px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginBottom: '0.8rem' },
  backBtn:      { width: '100%', padding: '10px', background: 'transparent', color: '#1E3A5F', border: '1px solid #1E3A5F', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  btn:          { width: '100%', padding: '11px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginBottom: '0.8rem' },
  error:        { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  successBox:   { textAlign: 'center', padding: '1rem 0' },
  successIcon:  { width: '60px', height: '60px', borderRadius: '50%', background: '#27AE60', color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  successTitle: { color: '#1E3A5F', fontSize: '1.4rem', marginBottom: '0.5rem' },
  successSub:   { color: '#888', marginBottom: '1.5rem' }
};

export default RideDetail;