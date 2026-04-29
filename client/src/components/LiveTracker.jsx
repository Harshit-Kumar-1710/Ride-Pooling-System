import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const LiveTracker = ({ rideId, userId }) => {
  const socketRef = useRef(null);
  const watchRef  = useRef(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError]       = useState('');
  const [status, setStatus]     = useState('idle');

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      return;
    }

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('driver:join', { rideId, driverId: userId });
    socketRef.current.emit('ride:started', { rideId });

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        socketRef.current?.emit('driver:location', { rideId, lat, lng });
        setStatus(`Sharing location — ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      (err) => setError('Location access denied. Please enable GPS.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    setTracking(true);
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    socketRef.current?.disconnect();
    setTracking(false);
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div style={styles.box}>
      <p style={styles.title}>📡 Live Tracking</p>
      {error && <p style={styles.error}>{error}</p>}
      {tracking && <p style={styles.status}>{status}</p>}
      {!tracking ? (
        <button style={styles.startBtn} onClick={startTracking}>
          Start Sharing Location
        </button>
      ) : (
        <button style={styles.stopBtn} onClick={stopTracking}>
          Stop Sharing
        </button>
      )}
    </div>
  );
};

const styles = {
  box:      { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' },
  title:    { fontWeight: '600', marginBottom: '0.6rem', fontSize: '0.9rem' },
  error:    { color: 'var(--red)', fontSize: '0.82rem', marginBottom: '0.6rem' },
  status:   { color: 'var(--green)', fontSize: '0.78rem', marginBottom: '0.6rem', wordBreak: 'break-all' },
  startBtn: { width: '100%', padding: '0.65rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  stopBtn:  { width: '100%', padding: '0.65rem', background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }
};

export default LiveTracker;