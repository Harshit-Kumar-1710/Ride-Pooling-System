import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const LiveTracker = ({ rideId, userId, userName, isDriver = true }) => {
  const socketRef = useRef(null);
  const watchRef  = useRef(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError]       = useState('');
  const [status, setStatus]     = useState('idle');
  const [driverActive, setDriverActive] = useState(false);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://ride-pooling-system.onrender.com';
    socketRef.current = io(SOCKET_URL);

    if (!isDriver) {
      socketRef.current.emit('passenger:join', { rideId });

      socketRef.current.on('driver:location', () => {
        setDriverActive(true);
      });

      socketRef.current.on('driver:locationStatus', ({ active }) => {
        setDriverActive(active);
      });
    }

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      socketRef.current?.disconnect();
    };
  }, [rideId, isDriver]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://ride-pooling-system.onrender.com';
      socketRef.current = io(SOCKET_URL);
    }

    socketRef.current.emit('driver:join', { rideId, driverId: userId });
    socketRef.current.emit('ride:started', { rideId });

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        socketRef.current?.emit('driver:location', { rideId, lat, lng });
        setStatus(`Live location active — ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setDriverActive(true);
      },
      (err) => setError('Location access denied. Please enable GPS in browser settings.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    setTracking(true);
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    socketRef.current?.emit('driver:stopLocation', { rideId });
    setTracking(false);
    setDriverActive(false);
    setStatus('idle');
  };

  if (!isDriver) {
    return (
      <div style={styles.box}>
        <p style={styles.title}>📡 Driver Live Tracking</p>
        {driverActive ? (
          <div style={styles.activePassengerBox}>
            <span style={styles.liveDot} />
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--green)' }}>
                Driver Live Location Active
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                Driver's real-time moving location is visible on your map.
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.inactivePassengerBox}>
            <p style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ⚪ Driver has not enabled live location sharing yet.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              The map will automatically update as soon as the driver starts location sharing.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.box}>
      <p style={styles.title}>🚗 Driver Live Location Control</p>
      {error && <p style={styles.error}>{error}</p>}
      {tracking && <p style={styles.status}>{status}</p>}
      {!tracking ? (
        <button style={styles.startBtn} onClick={startTracking}>
          📡 Enable Live Location Sharing
        </button>
      ) : (
        <button style={styles.stopBtn} onClick={stopTracking}>
          🛑 Disable Live Location Sharing
        </button>
      )}
    </div>
  );
};

const styles = {
  box:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', animation: 'fadeInUp 0.3s ease' },
  title:    { fontWeight: '700', marginBottom: '0.6rem', fontSize: '0.88rem', color: 'var(--text-primary)' },
  error:    { color: 'var(--red)', fontSize: '0.82rem', marginBottom: '0.6rem' },
  status:   { color: 'var(--green)', fontSize: '0.78rem', marginBottom: '0.6rem', wordBreak: 'break-all', fontWeight: '600' },
  startBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, var(--green), #16a34a)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)' },
  stopBtn:  { width: '100%', padding: '0.75rem', background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700' },
  activePassengerBox: { background: 'var(--green-soft)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' },
  inactivePassengerBox: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem' },
  liveDot:  { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: '3px', animation: 'pulse 1.5s infinite' }
};

export default LiveTracker;
