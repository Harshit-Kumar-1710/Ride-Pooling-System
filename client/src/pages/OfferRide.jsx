import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const OfferRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    originLabel: '',
    originLat: '', originLng: '',
    destinationLabel: '',
    destinationLat: '', destinationLng: '',
    departureTime: '',
    seatsAvailable: 1
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/rides', {
        origin: {
          label: form.originLabel,
          latitude: parseFloat(form.originLat),
          longitude: parseFloat(form.originLng)
        },
        destination: {
          label: form.destinationLabel,
          latitude: parseFloat(form.destinationLat),
          longitude: parseFloat(form.destinationLng)
        },
        departureTime: form.departureTime,
        seatsAvailable: parseInt(form.seatsAvailable)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Offer a Ride</h2>
        <p style={styles.sub}>Fill in your route details</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>

          <label style={styles.label}>Origin</label>
          <input style={styles.input} name="originLabel"
            placeholder="Origin name (e.g. GEU Campus)"
            value={form.originLabel} onChange={handleChange} required />
          <div style={styles.row}>
            <input style={styles.half} name="originLat"
              placeholder="Latitude (e.g. 30.3165)"
              value={form.originLat} onChange={handleChange} required />
            <input style={styles.half} name="originLng"
              placeholder="Longitude (e.g. 78.0322)"
              value={form.originLng} onChange={handleChange} required />
          </div>

          <label style={styles.label}>Destination</label>
          <input style={styles.input} name="destinationLabel"
            placeholder="Destination name (e.g. Dehradun Railway Station)"
            value={form.destinationLabel} onChange={handleChange} required />
          <div style={styles.row}>
            <input style={styles.half} name="destinationLat"
              placeholder="Latitude"
              value={form.destinationLat} onChange={handleChange} required />
            <input style={styles.half} name="destinationLng"
              placeholder="Longitude"
              value={form.destinationLng} onChange={handleChange} required />
          </div>

          <label style={styles.label}>Departure time</label>
          <input style={styles.input} name="departureTime"
            type="datetime-local"
            value={form.departureTime} onChange={handleChange} required />

          <label style={styles.label}>Seats available</label>
          <input style={styles.input} name="seatsAvailable"
            type="number" min="1" max="6"
            value={form.seatsAvailable} onChange={handleChange} required />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Posting ride...' : 'Post Ride'}
          </button>
          <button style={styles.back} type="button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '2rem 1rem' },
  card:  { background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '500px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { color: '#1E3A5F', marginBottom: '0.3rem' },
  sub:   { color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#444', marginBottom: '4px', marginTop: '0.8rem' },
  input: { display: 'block', width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '0.5rem' },
  row:   { display: 'flex', gap: '0.8rem' },
  half:  { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box' },
  btn:   { width: '100%', padding: '11px', background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '1.2rem' },
  back:  { width: '100%', padding: '10px', background: 'transparent', color: '#1E3A5F', border: '1px solid #1E3A5F', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.8rem' },
  error: { background: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }
};

export default OfferRide;