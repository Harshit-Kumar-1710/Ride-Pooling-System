import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
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


const getMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
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
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResult, setNlpResult] = useState(null);

  const handleNlpSearch = async () => {
    if (!nlpQuery.trim()) return;
    const result = await parseRideQuery(nlpQuery);
    setNlpResult(result);
    if (result.pickup) {
      setPickup(result.pickup);
      setStep('drop');
    }
    if (result.drop) setDrop(result.drop);
    if (result.time) setPreferredTime(result.time);
  };

  const handleSearch = async () => {
    if (!pickup || !drop) return setError('Please select pickup and drop on the map.');
    
    if (preferredTime && new Date(preferredTime) < new Date()) {
      return setError('The selected preferred time is invalid (cannot be in the past).');
    }

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
              {/* NLP Smart Search */}
              <div style={styles.nlpSection}>
                <label style={styles.nlpLabel}>🧠 Smart Search</label>
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
                    <span style={{ ...styles.nlpPill, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>⚠️ Please add time (optional) below</span>
                  )}
                </div>
              )}
                {nlpResult && !nlpResult.understood && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>Couldn't understand. Try: "from GEU to ISBT tomorrow 9am"</p>
                )}
              </div>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or search manually</span>
              </div>
              <div style={styles.section}>
                <label style={styles.label}>
                  <span style={{ color: 'var(--green)' }}>● </span>
                  Pickup — {pickup ? pickup.label : 'click map or search'}
                </label>
                <LocationSearch placeholder="Search pickup..." onSelect={(loc) => { setPickup(loc); setStep('drop'); }} />
              </div>

              <div style={styles.section}>
                <label style={styles.label}>
                  <span style={{ color: 'var(--accent)' }}>● </span>
                  Drop — {drop ? drop.label : 'click map or search'}
                </label>
                <LocationSearch placeholder="Search drop..." onSelect={(loc) => { setDrop(loc); }} />
              </div>

              <div style={styles.mapHint}>
                <span style={{ color: step === 'pickup' ? 'var(--green)' : 'var(--accent)', fontSize: '0.82rem' }}>
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
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={styles.spinner} /> Searching...
                  </span>
                ) : '🔍  Search Rides'}
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
                      <div key={ride._id} style={{ ...styles.rideCard, animationDelay: `${i * 0.08}s` }}
                        onClick={() => navigate(`/rides/${ride._id}`, { state: { ride, pickup, drop } })}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}>
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
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)', touchAction: 'none' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              <MapClickHandler step={step}
                onPickupSet={(loc) => { setPickup(loc); setStep('drop'); }}
                onDropSet={(loc) => { setDrop(loc); }} />
              {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}><Popup>{pickup.label}</Popup></Marker>}
              {drop   && <Marker position={[drop.lat,   drop.lng]}   icon={dropIcon}><Popup>{drop.label}</Popup></Marker>}
              {pickup && drop && (
                <Polyline positions={[[pickup.lat, pickup.lng], [drop.lat, drop.lng]]}
                  color="#e63946" weight={3} dashArray="8 6" />
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
  container:   { maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  backBtn:     { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' },
  title:       { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' },
  grid:        { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', height: '80vh' },
  leftPanel:   { display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
  formCard:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },
  mapPanel:    { borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  section:     { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:       { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input:       { padding: '0.7rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s ease' },
  mapHint:     { fontSize: '0.82rem', color: 'var(--text-muted)' },
  error:       { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', animation: 'fadeInUp 0.3s ease' },
  searchBtn:   { padding: '0.85rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)' },
  spinner:     { display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  results:     { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  resultCount: { color: 'var(--text-muted)', fontSize: '0.82rem' },
  rideCard:    { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'fadeInUp 0.4s ease forwards', opacity: 0 },
  rideTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
  matchBadge:  { fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '99px' },
  seats:       { color: 'var(--text-muted)', fontSize: '0.82rem' },
  rideRoute:   { fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.2rem' },
  rideDriver:  { color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.6rem' },
  rideMeta:    { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' },
  chip:        { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '99px' },
  bookArrow:   { color: 'var(--accent)', fontSize: '0.82rem', fontWeight: '600' },
  empty:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', animation: 'fadeInUp 0.4s ease' },
  emptyIcon:   { fontSize: '2rem', marginBottom: '0.8rem' },
  emptyText:   { fontWeight: '600', marginBottom: '0.3rem' },
  emptySub:    { color: 'var(--text-muted)', fontSize: '0.85rem' },

  nlpSection:  { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  nlpLabel:    { fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' },
  nlpRow:      { display: 'flex', gap: '0.5rem' },
  nlpInput:    { flex: 1, padding: '0.7rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s ease' },
  nlpBtn:      { padding: '0.7rem 1rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1rem', color: '#fff' },
  nlpPills:    { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' },
  nlpPill:     { background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(230, 57, 70, 0.2)' },
  divider:     { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  dividerText: { color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' },
};

export default FindRide;