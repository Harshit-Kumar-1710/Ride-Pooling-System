import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const FindRide = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickupLabel: '', pickupLat: '', pickupLng: '',
    dropLabel: '',   dropLat: '',   dropLng: '',
    preferredTime: ''
  });
  const [rides, setRides]     = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/rides/search', {
        pickupLat:   form.pickupLat,
        pickupLng:   form.pickupLng,
        pickupLabel: form.pickupLabel,
        dropLat:     form.dropLat,
        dropLng:     form.dropLng,
        dropLabel:   form.dropLabel,
        preferredTime: form.preferredTime || undefined
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

  return (
    <div style={styles.container}>

      {/* Search Form */}
      <div style={styles.card}>
        <h2 style={styles.title}>Find a Ride</h2>
        <p style={styles.sub}>Enter your pickup and drop location</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSearch}>
          <label style={styles.label}>Pickup location</label>
          <input style={styles.input} name="pickupLabel"
            placeholder="Pickup name (e.g. GEU Hostel)"
            value={form.pickupLabel} onChange={handleChange} required />
          <div style={styles.row}>
            <input style={styles.half} name="pickupLat"
              placeholder="Latitude" value={form.pickupLat}
              onChange={handleChange} required />
            <input style={styles.half} name="pickupLng"
              placeholder="Longitude" value={form.pickupLng}
              onChange={handleChange} required />
          </div>

          <label style={styles.label}>Drop location</label>
          <input style={styles.input} name="dropLabel"
            placeholder="Drop name (e.g. Dehradun Bus Stand)"
            value={form.dropLabel} onChange={handleChange} required />
          <div style={styles.row}>
            <input style={styles.half} name="dropLat"
              placeholder="Latitude" value={form.dropLat}
              onChange={handleChange} required />
            <input style={styles.half} name="dropLng"
              placeholder="Longitude" value={form.dropLng}
              onChange={handleChange} required />
          </div>

          <label style={styles.label}>Preferred departure time (optional)</label>
          <input style={styles.input} name="preferredTime"
            type="datetime-local" value={form.preferredTime}
            onChange={handleChange} />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search Rides'}
          </button>
          <button style={styles.back} type="button"
            onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div style={styles.results}>
          {rides.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No rides found on your route.</p>
              <p style={styles.emptySub}>Try different coordinates or a different time.</p>
            </div>
          ) : (
            <>
              <p style={styles.resultCount}>{rides.length} ride{rides.length > 1 ? 's' : ''} found</p>
              {rides.map((ride, i) => (
                <div key={ride._id} style={styles.rideCard}>
                  <div style={styles.rideTop}>
                    <div>
                      <p style={styles.route}>
                        {ride.origin.label} → {ride.destination.label}
                      </p>
                      <p style={styles.driver}>
                        Driver: {ride.driverId.name} ({ride.driverId.collegeId})
                      </p>
                    </div>
                    <div style={styles.badge}>#{i + 1} match</div>
                  </div>
                  <div style={styles.rideInfo}>
                    <span style={styles.chip}>🕐 {formatTime(ride.departureTime)}</span>
                    <span style={styles.chip}>💺 {ride.seatsAvailable} seats</span>
                    <span style={styles.chip}>📍 {ride.detourDistance} km detour</span>
                    <span style={styles.chip}>⭐ {ride.driverId.rating}/5</span>
                  </div>
                  <button style={styles.bookBtn}
                    onClick={() => navigate(`/rides/${ride._id}`, { state: { ride, form } })}>
                    View & Book
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '2rem 1rem' },
  card:  { background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '540px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { color: '#1E3A5F', marginBottom: '0.3rem' },
  sub:   { color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#444', marginBottom: '4px', marginTop: '0.8rem' },
  input: { display: 'block', width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '0.5rem' },
  row:   { display: 'flex', gap: '0.8rem' },
  half:  { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '0.5rem' },
  btn:   { width: '100%', padding: '11px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' },
  back:  { width: '100%', padding: '10px', background: 'transparent', color: '#1E3A5F', border: '1px solid #1E3A5F', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.8rem' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  results:     { maxWidth: '540px', margin: '1.5rem auto 0' },
  resultCount: { color: '#555', fontSize: '0.9rem', marginBottom: '1rem' },
  rideCard:    { background: '#fff', borderRadius: '12px', padding: '1.2rem 1.5rem', marginBottom: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  rideTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' },
  route:       { fontWeight: '600', color: '#1E3A5F', fontSize: '0.95rem', marginBottom: '0.2rem' },
  driver:      { color: '#777', fontSize: '0.85rem' },
  badge:       { background: '#E8EEF5', color: '#1E3A5F', fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  rideInfo:    { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  chip:        { background: '#f5f5f5', color: '#555', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' },
  bookBtn:     { width: '100%', padding: '10px', background: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer' },
  empty:       { background: '#fff', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' },
  emptyText:   { color: '#555', fontWeight: '600', marginBottom: '0.5rem' },
  emptySub:    { color: '#999', fontSize: '0.85rem' }
};

export default FindRide;