import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../services/api';
import LocationSearch from '../components/LocationSearch';
import { parseRideQuery } from '../utils/nlpParser';

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


const getMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const OfferRide = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState('origin');
  const [origin, setOrigin]       = useState(null);
  const [dest, setDest]           = useState(null);
  const [form, setForm]           = useState({ departureTime: '', seatsAvailable: 1 });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [nlpQuery, setNlpQuery]   = useState('');
  const [nlpResult, setNlpResult] = useState(null);

  const handleNlpSearch = async () => {
    if (!nlpQuery.trim()) return;
    const result = await parseRideQuery(nlpQuery);
    setNlpResult(result);
    if (result.pickup) { setOrigin(result.pickup); setStep('dest'); }
    if (result.drop) setDest(result.drop);
    if (result.time) setForm(f => ({ ...f, departureTime: result.time }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin || !dest) return setError('Please select origin and destination on the map.');
    if (!form.departureTime) return setError('Please set your departure time.');
    
    // Check if time is in the past
    if (new Date(form.departureTime) < new Date()) {
      return setError('The selected date and time is invalid (cannot be in the past).');
    }
    
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
              <div style={{ ...styles.stepDot, background: step === 'origin' ? 'var(--green)' : 'var(--accent)', boxShadow: step === 'origin' ? '0 0 10px var(--green)' : 'none' }} />
              <div style={styles.stepLine} />
              <div style={{ ...styles.stepDot, background: step === 'dest' ? 'var(--accent)' : dest ? 'var(--accent)' : 'var(--border)', boxShadow: step === 'dest' ? '0 0 10px var(--accent)' : 'none' }} />
            </div>

            <div style={styles.section}>
              <label style={styles.nlpLabel}>🧠 Smart Fill</label>
              <div style={styles.nlpRow}>
                <input
                  style={styles.nlpInput}
                  placeholder='Try: "GEU to ISBT tomorrow 9am"'
                  value={nlpQuery}
                  onChange={e => setNlpQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNlpSearch()}
                />
                <button style={styles.nlpBtn} onClick={handleNlpSearch} type="button">🚀</button>
              </div>
              {nlpResult && nlpResult.understood && (
                <div style={styles.nlpPills}>
                  {nlpResult.pickup && <span style={styles.nlpPill}>📍 {nlpResult.pickup.label}</span>}
                  {nlpResult.pickup && nlpResult.drop && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                  {nlpResult.drop && <span style={styles.nlpPill}>📍 {nlpResult.drop.label}</span>}
                  {nlpResult.time ? (
                    <span style={styles.nlpPill}>🕐 {new Date(nlpResult.time).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  ) : (
                    <span style={{ ...styles.nlpPill, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>⚠️ Please set a time below</span>
                  )}
                </div>
              )}
              {nlpResult && !nlpResult.understood && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>Couldn't parse. Try: "from GEU to ISBT tomorrow 9am"</p>
              )}
            </div>

            <div style={styles.divider}><span style={styles.dividerText}>or fill manually</span></div>

            <div style={styles.section}>
              <label style={styles.label}>
                <span style={{ color: 'var(--green)' }}>● </span>
                Origin — {origin ? origin.label : 'click map or search'}
              </label>
              <LocationSearch placeholder="Search origin..." onSelect={(loc) => { setOrigin(loc); setStep('dest'); }} />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>
                <span style={{ color: 'var(--accent)' }}>● </span>
                Destination — {dest ? dest.label : 'click map or search'}
              </label>
              <LocationSearch placeholder="Search destination..." onSelect={(loc) => { setDest(loc); }} />
            </div>

            <div style={styles.mapHint}>
              <span style={{ color: step === 'origin' ? 'var(--green)' : 'var(--accent)' }}>
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
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={styles.spinner} /> Posting...
                </span>
              ) : 'Post Ride →'}
            </button>
          </div>

          {/* Right — map */}
          <div style={styles.mapPanel}>
            <MapContainer center={[30.3165, 78.0322]} zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)', touchAction: 'none' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              <MapClickHandler step={step}
                onOriginSet={(loc) => { setOrigin(loc); setStep('dest'); }}
                onDestSet={(loc) => { setDest(loc); }} />
              {origin && <Marker position={[origin.lat, origin.lng]} icon={originIcon}><Popup>{origin.label}</Popup></Marker>}
              {dest && <Marker position={[dest.lat, dest.lng]} icon={destIcon}><Popup>{dest.label}</Popup></Marker>}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem' },
  container:   { maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.4s ease' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' },
  title:       { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' },
  grid:        { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', height: '75vh' },
  formPanel:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },
  mapPanel:    { borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  stepIndicator:{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  stepDot:     { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s ease' },
  stepLine:    { flex: 1, height: '2px', background: 'var(--border)' },
  section:     { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:       { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input:       { padding: '0.7rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s ease' },
  mapHint:     { fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  switchBtn:   { background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem' },
  seatsRow:    { display: 'flex', gap: '0.5rem' },
  seatBtn:     { flex: 1, padding: '0.55rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease' },
  seatBtnActive:{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent)', boxShadow: '0 0 10px rgba(230, 57, 70, 0.15)' },
  error:       { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', animation: 'fadeInUp 0.3s ease' },
  summary:     { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', gap: '0.5rem' },
  submitBtn:   { padding: '0.85rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: 'auto', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)' },
  spinner:     { display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },

  nlpLabel:    { fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' },
  nlpRow:      { display: 'flex', gap: '0.5rem' },
  nlpInput:    { flex: 1, padding: '0.7rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s ease' },
  nlpBtn:      { padding: '0.7rem 1rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1rem', color: '#fff' },
  nlpPills:    { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' },
  nlpPill:     { background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(230, 57, 70, 0.2)' },
  divider:     { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  dividerText: { color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' },
};

export default OfferRide;