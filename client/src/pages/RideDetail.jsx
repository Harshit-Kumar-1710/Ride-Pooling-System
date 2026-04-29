import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const RideDetail = () => {
  const { id }    = useParams();
  const { state } = useLocation();
  const navigate  = useNavigate();
  const ride      = state?.ride;
  const pickup    = state?.pickup;
  const drop      = state?.drop;

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [booked, setBooked]   = useState(false);
  const [route, setRoute]     = useState(null);

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });

  // Fetch OSRM route for display
  useEffect(() => {
    if (!ride) return;
    const fetchRoute = async () => {
      try {
        const { origin, destination } = ride;
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(coords);
        }
      } catch { }
    };
    fetchRoute();
  }, [ride]);

  const handleBook = async () => {
    if (!pickup || !drop) {
      setError('Pickup and drop location missing. Go back and search again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/bookings', {
        rideId: id,
        pickupPoint: {
          label:     pickup.label || 'Pickup',
          latitude:  parseFloat(pickup.lat),
          longitude: parseFloat(pickup.lng)
        },
        dropPoint: {
          label:     drop.label || 'Drop',
          latitude:  parseFloat(drop.lat),
          longitude: parseFloat(drop.lng)
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
    <div style={styles.page}>
      <div style={styles.empty}>
        <p>Ride not found. Go back and search again.</p>
        <button style={styles.backBtn} onClick={() => navigate('/find-ride')}>Back to Search</button>
      </div>
    </div>
  );

  const mapCenter = [ride.origin.latitude, ride.origin.longitude];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/find-ride')}>← Back</button>
          <h2 style={styles.title}>Ride Details</h2>
        </div>

        {booked ? (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Ride Booked!</h2>
            <p style={styles.successSub}>Your seat is confirmed. Have a safe trip.</p>
            <div style={styles.successBtns}>
              <button style={styles.primaryBtn} onClick={() => navigate('/my-rides')}>View My Rides</button>
              <button style={styles.ghostBtn}   onClick={() => navigate('/dashboard')}>Dashboard</button>
            </div>
          </div>
        ) : (
          <div style={styles.grid}>

            {/* Left — details */}
            <div style={styles.leftPanel}>

              {/* Route */}
              <div style={styles.card}>
                <div style={styles.routeRow}>
                  <div style={styles.routeStop}>
                    <div style={{ ...styles.routeDot, background: 'var(--green)' }} />
                    <div>
                      <p style={styles.routeLabel}>From</p>
                      <p style={styles.routeName}>{ride.origin.label}</p>
                    </div>
                  </div>
                  <div style={styles.routeLine} />
                  <div style={styles.routeStop}>
                    <div style={{ ...styles.routeDot, background: 'var(--red)' }} />
                    <div>
                      <p style={styles.routeLabel}>To</p>
                      <p style={styles.routeName}>{ride.destination.label}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div style={styles.infoGrid}>
                {[
                  { label: 'Departure',   value: formatTime(ride.departureTime), icon: '🕐' },
                  { label: 'Seats left',  value: `${ride.seatsAvailable} / ${ride.seatsTotal}`, icon: '💺' },
                  { label: 'Detour',      value: `${ride.detourDistance ?? 0} km`, icon: '📍' },
                  { label: 'Rating',      value: `${ride.driverId?.rating ?? 3}/5`, icon: '⭐' },
                ].map(item => (
                  <div key={item.label} style={styles.infoCard}>
                    <div style={styles.infoIcon}>{item.icon}</div>
                    <div style={styles.infoValue}>{item.value}</div>
                    <div style={styles.infoLabel}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Driver */}
              <div style={styles.card}>
                <p style={styles.sectionLabel}>Driver</p>
                <div style={styles.driverRow}>
                  <div style={styles.driverAvatar}>
                    {ride.driverId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.driverName}>{ride.driverId?.name}</p>
                    <p style={styles.driverId}>{ride.driverId?.collegeId} · GEU verified</p>
                  </div>
                </div>
              </div>

              {/* Your pickup/drop */}
              {pickup && drop && (
                <div style={styles.card}>
                  <p style={styles.sectionLabel}>Your journey</p>
                  <div style={styles.journeyRow}>
                    <span style={{ color: 'var(--green)' }}>●</span>
                    <span style={styles.journeyLabel}>Pickup: {pickup.label}</span>
                  </div>
                  <div style={styles.journeyRow}>
                    <span style={{ color: 'var(--red)' }}>●</span>
                    <span style={styles.journeyLabel}>Drop: {drop.label}</span>
                  </div>
                </div>
              )}

              {error && <div style={styles.error}>{error}</div>}

              <button style={styles.bookBtn} onClick={handleBook} disabled={loading}>
                {loading ? 'Booking...' : '✓  Confirm Booking — Free'}
              </button>

            </div>

            {/* Right — map */}
            <div style={styles.mapPanel}>
              <MapContainer center={mapCenter} zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />

                <Marker position={[ride.origin.latitude, ride.origin.longitude]} icon={originIcon}>
                  <Popup>Origin: {ride.origin.label}</Popup>
                </Marker>
                <Marker position={[ride.destination.latitude, ride.destination.longitude]} icon={destIcon}>
                  <Popup>Destination: {ride.destination.label}</Popup>
                </Marker>
                {pickup && (
                  <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                    <Popup>Your pickup: {pickup.label}</Popup>
                  </Marker>
                )}

                {route && (
                  <Polyline positions={route} color="#7c6aff" weight={4} opacity={0.8} />
                )}
              </MapContainer>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:         { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:    { maxWidth: '1100px', margin: '0 auto' },
  header:       { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn:      { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  title:        { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' },
  grid:         { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', minHeight: '70vh' },
  leftPanel:    { display: 'flex', flexDirection: 'column', gap: '1rem' },
  mapPanel:     { borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '500px' },
  card:         { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem' },
  routeRow:     { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  routeStop:    { display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 },
  routeDot:     { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  routeLine:    { flex: 1, height: '2px', background: 'var(--border)' },
  routeLabel:   { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' },
  routeName:    { fontSize: '0.9rem', fontWeight: '600' },
  infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  infoCard:     { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' },
  infoIcon:     { fontSize: '1.2rem', marginBottom: '0.4rem' },
  infoValue:    { fontSize: '1rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.2rem' },
  infoLabel:    { fontSize: '0.75rem', color: 'var(--text-muted)' },
  sectionLabel: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  driverRow:    { display: 'flex', alignItems: 'center', gap: '0.9rem' },
  driverAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', flexShrink: 0 },
  driverName:   { fontWeight: '600', marginBottom: '0.2rem' },
  driverId:     { color: 'var(--text-muted)', fontSize: '0.82rem' },
  journeyRow:   { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' },
  journeyLabel: { color: 'var(--text-secondary)', fontSize: '0.85rem' },
  error:        { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' },
  bookBtn:      { padding: '0.9rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' },
  successCard:  { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' },
  successIcon:  { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' },
  successTitle: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' },
  successSub:   { color: 'var(--text-secondary)', marginBottom: '2rem' },
  successBtns:  { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  primaryBtn:   { padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  ghostBtn:     { padding: '0.85rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', cursor: 'pointer' },
  empty:        { textAlign: 'center', padding: '3rem' },
};

export default RideDetail;