import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const MapClickHandler = ({ step, onPickupSet, onDropSet }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const label = data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      if (step === 'pickup') onPickupSet({ lat, lng, label });
      else onDropSet({ lat, lng, label });
    }
  });
  return null;
};

const SearchBox = ({ placeholder, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`);
      const data = await res.json();
      setResults(data);
    } catch { }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={sStyles.searchRow}>
        <input style={sStyles.searchInput} placeholder={placeholder}
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()} />
        <button style={sStyles.searchBtn} onClick={search} type="button">
          {loading ? '...' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <div style={sStyles.results}>
          {results.map((r, i) => (
            <div key={i} style={sStyles.resultItem}
              onClick={() => {
                onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name?.split(',').slice(0, 2).join(',') });
                setResults([]);
                setQuery(r.display_name?.split(',').slice(0, 2).join(','));
              }}>
              📍 {r.display_name?.split(',').slice(0, 3).join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const sStyles = {
  searchRow:   { display: 'flex', gap: '0.5rem' },
  searchInput: { flex: 1, padding: '0.65rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' },
  searchBtn:   { padding: '0.65rem 0.9rem', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1rem' },
  results:     { position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', zIndex: 1000, maxHeight: '200px', overflowY: 'auto' },
  resultItem:  { padding: '0.6rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }
};

const FindRide = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState('pickup');
  const [pickup, setPickup]     = useState(null);
  const [drop, setDrop]         = useState(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [rides, setRides]       = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSearch = async () => {
    if (!pickup || !drop) return setError('Please select pickup and drop on the map.');
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/rides/search', {
        pickupLat: pickup.lat, pickupLng: pickup.lng, pickupLabel: pickup.label,
        dropLat:   drop.lat,   dropLng:   drop.lng,   dropLabel:   drop.label,
        ...(preferredTime && { preferredTime })
      });
      setRides(res.data.rides);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const scoreColor = (score) => {
    if (score < 0) return 'var(--green)';
    if (score < 0.2) return 'var(--accent)';
    return 'var(--orange)';
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
          <h2 style={styles.title}>Find a Ride</h2>
        </div>

        <div style={styles.grid}>
          {/* Left panel */}
          <div style={styles.leftPanel}>
            <div style={styles.formCard}>
              <div style={styles.section}>
                <label style={styles.label}>
                  <span style={{ color: 'var(--green)' }}>● </span>
                  Pickup — {pickup ? pickup.label : 'click map or search'}
                </label>
                <SearchBox placeholder="Search pickup..." onSelect={(loc) => { setPickup(loc); setStep('drop'); }} />
              </div>

              <div style={styles.section}>
                <label style={styles.label}>
                  <span style={{ color: 'var(--red)' }}>● </span>
                  Drop — {drop ? drop.label : 'click map or search'}
                </label>
                <SearchBox placeholder="Search drop..." onSelect={(loc) => { setDrop(loc); }} />
              </div>

              <div style={styles.mapHint}>
                <span style={{ color: step === 'pickup' ? 'var(--green)' : 'var(--red)', fontSize: '0.82rem' }}>
                  {step === 'pickup' ? '● Click map to set pickup' : '● Click map to set drop'}
                </span>
              </div>

              <div style={styles.section}>
                <label style={styles.label}>Preferred time (optional)</label>
                <input style={styles.input} type="datetime-local"
                  value={preferredTime} onChange={e => setPreferredTime(e.target.value)} />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button style={styles.searchBtn} onClick={handleSearch} disabled={loading || !pickup || !drop}>
                {loading ? 'Searching...' : '🔍  Search Rides'}
              </button>
            </div>

            {/* Results */}
            {searched && (
              <div style={styles.results}>
                {rides.length === 0 ? (
                  <div style={styles.empty}>
                    <div style={styles.emptyIcon}>🚗</div>
                    <p style={styles.emptyText}>No rides found on your route</p>
                    <p style={styles.emptySub}>Try different coordinates or remove the time filter</p>
                  </div>
                ) : (
                  <>
                    <p style={styles.resultCount}>{rides.length} ride{rides.length > 1 ? 's' : ''} found</p>
                    {rides.map((ride, i) => (
                      <div key={ride._id} style={styles.rideCard}
                        onClick={() => navigate(`/rides/${ride._id}`, { state: { ride, pickup, drop } })}>
                        <div style={styles.rideTop}>
                          <div style={{ ...styles.matchBadge, background: scoreColor(ride.score) + '22', color: scoreColor(ride.score), border: `1px solid ${scoreColor(ride.score)}44` }}>
                            #{i + 1} match
                          </div>
                          <span style={styles.seats}>💺 {ride.seatsAvailable} seats</span>
                        </div>
                        <p style={styles.rideRoute}>
                          {ride.origin.label} → {ride.destination.label}
                        </p>
                        <p style={styles.rideDriver}>
                          {ride.driverId.name} · {ride.driverId.collegeId}
                        </p>
                        <div style={styles.rideMeta}>
                          <span style={styles.chip}>🕐 {formatTime(ride.departureTime)}</span>
                          <span style={styles.chip}>📍 {ride.detourDistance} km detour</span>
                          <span style={styles.chip}>⭐ {ride.driverId.rating}/5</span>
                        </div>
                        <div style={styles.bookArrow}>View & Book →</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div style={styles.mapPanel}>
            <MapContainer center={[30.3165, 78.0322]} zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              <MapClickHandler
                step={step}
                onPickupSet={(loc) => { setPickup(loc); setStep('drop'); }}
                onDropSet={(loc) => { setDrop(loc); }}
              />
              {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}><Popup>{pickup.label}</Popup></Marker>}
              {drop   && <Marker position={[drop.lat,   drop.lng]}   icon={dropIcon}><Popup>{drop.label}</Popup></Marker>}
              {pickup && drop && (
                <Polyline positions={[[pickup.lat, pickup.lng], [drop.lat, drop.lng]]}
                  color="#7c6aff" weight={3} dashArray="8 6" />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:   { maxWidth: '1200px', margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  title:       { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' },
  grid:        { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', height: '80vh' },
  leftPanel:   { display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
  formCard:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  mapPanel:    { borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' },
  section:     { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:       { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input:       { padding: '0.65rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' },
  mapHint:     { fontSize: '0.82rem', color: 'var(--text-muted)' },
  error:       { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' },
  searchBtn:   { padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  results:     { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  resultCount: { color: 'var(--text-muted)', fontSize: '0.82rem' },
  rideCard:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.1rem', cursor: 'pointer', transition: 'border-color 0.15s' },
  rideTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
  matchBadge:  { fontSize: '0.75rem', fontWeight: '700', padding: '2px 10px', borderRadius: '99px' },
  seats:       { color: 'var(--text-muted)', fontSize: '0.82rem' },
  rideRoute:   { fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.2rem' },
  rideDriver:  { color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.6rem' },
  rideMeta:    { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' },
  chip:        { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.78rem', padding: '3px 8px', borderRadius: '99px' },
  bookArrow:   { color: 'var(--accent)', fontSize: '0.82rem', fontWeight: '600' },
  empty:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' },
  emptyIcon:   { fontSize: '2rem', marginBottom: '0.8rem' },
  emptyText:   { fontWeight: '600', marginBottom: '0.3rem' },
  emptySub:    { color: 'var(--text-muted)', fontSize: '0.85rem' }
};

export default FindRide;