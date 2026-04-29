import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

const MapClickHandler = ({ onOriginSet, onDestSet, step }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const label = data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      if (step === 'origin') onOriginSet({ lat, lng, label });
      else onDestSet({ lat, lng, label });
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

const OfferRide = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState('origin');
  const [origin, setOrigin]       = useState(null);
  const [dest, setDest]           = useState(null);
  const [form, setForm]           = useState({ departureTime: '', seatsAvailable: 1 });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin || !dest) return setError('Please select origin and destination on the map.');
    setLoading(true);
    setError('');
    try {
      await API.post('/rides', {
        origin:      { label: origin.label, latitude: origin.lat, longitude: origin.lng },
        destination: { label: dest.label,   latitude: dest.lat,   longitude: dest.lng },
        departureTime:  form.departureTime,
        seatsAvailable: parseInt(form.seatsAvailable)
      });
      navigate('/my-rides');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
          <h2 style={styles.title}>Offer a Ride</h2>
        </div>

        <div style={styles.grid}>
          {/* Left — form */}
          <div style={styles.formPanel}>
            <div style={styles.stepIndicator}>
              <div style={{ ...styles.stepDot, background: step === 'origin' ? 'var(--green)' : 'var(--accent)' }} />
              <div style={styles.stepLine} />
              <div style={{ ...styles.stepDot, background: step === 'dest' ? 'var(--red)' : dest ? 'var(--accent)' : 'var(--border)' }} />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>
                <span style={{ color: 'var(--green)' }}>● </span>
                Origin — {origin ? origin.label : 'click map or search'}
              </label>
              <SearchBox placeholder="Search origin..." onSelect={(loc) => { setOrigin(loc); setStep('dest'); }} />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>
                <span style={{ color: 'var(--red)' }}>● </span>
                Destination — {dest ? dest.label : 'click map or search'}
              </label>
              <SearchBox placeholder="Search destination..." onSelect={(loc) => { setDest(loc); }} />
            </div>

            <div style={styles.mapHint}>
              <span style={{ color: step === 'origin' ? 'var(--green)' : 'var(--red)' }}>
                {step === 'origin' ? '● Click map to set origin' : '● Click map to set destination'}
              </span>
              {origin && !dest && <button style={styles.switchBtn} onClick={() => setStep('dest')} type="button">Set destination instead</button>}
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Departure time</label>
              <input style={styles.input} type="datetime-local"
                value={form.departureTime}
                onChange={e => setForm({ ...form, departureTime: e.target.value })} required />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Seats available</label>
              <div style={styles.seatsRow}>
                {[1,2,3,4,5,6].map(n => (
                  <button key={n} type="button"
                    style={{ ...styles.seatBtn, ...(form.seatsAvailable == n ? styles.seatBtnActive : {}) }}
                    onClick={() => setForm({ ...form, seatsAvailable: n })}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.summary}>
              {origin && <div style={styles.summaryItem}><span>From</span><strong>{origin.label}</strong></div>}
              {dest   && <div style={styles.summaryItem}><span>To</span><strong>{dest.label}</strong></div>}
            </div>

            <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading || !origin || !dest}>
              {loading ? 'Posting...' : 'Post Ride →'}
            </button>
          </div>

          {/* Right — map */}
          <div style={styles.mapPanel}>
            <MapContainer
              center={[30.3165, 78.0322]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />
              <MapClickHandler
                step={step}
                onOriginSet={(loc) => { setOrigin(loc); setStep('dest'); }}
                onDestSet={(loc) => { setDest(loc); }}
              />
              {origin && (
                <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
                  <Popup>{origin.label}</Popup>
                </Marker>
              )}
              {dest && (
                <Marker position={[dest.lat, dest.lng]} icon={destIcon}>
                  <Popup>{dest.label}</Popup>
                </Marker>
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
  container:   { maxWidth: '1100px', margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' },
  title:       { fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' },
  grid:        { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', height: '75vh' },
  formPanel:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
  mapPanel:    { borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' },
  stepIndicator:{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  stepDot:     { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  stepLine:    { flex: 1, height: '2px', background: 'var(--border)' },
  section:     { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:       { fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input:       { padding: '0.65rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' },
  mapHint:     { fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  switchBtn:   { background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem' },
  seatsRow:    { display: 'flex', gap: '0.5rem' },
  seatBtn:     { flex: 1, padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' },
  seatBtnActive:{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent)' },
  error:       { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' },
  summary:     { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', gap: '0.5rem' },
  submitBtn:   { padding: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' }
};

export default OfferRide;