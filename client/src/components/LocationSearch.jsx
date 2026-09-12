import { useState, useRef, useEffect } from 'react';
import { getKnownLocations } from '../utils/nlpParser';

// Known local landmarks with coordinates in Uttarakhand
const POPULAR_UTTARAKHAND_LOCATIONS = [
  { label: 'Graphic Era University, Dehradun', lat: 30.2729, lon: 78.0687, type: 'university' },
  { label: 'Graphic Era Hill University, Dehradun', lat: 30.2735, lon: 78.0695, type: 'university' },
  { label: 'Graphic Era Hill University, Bhimtal', lat: 29.3524, lon: 79.5530, type: 'university' },
  { label: 'Graphic Era University, Haldwani Campus', lat: 29.2150, lon: 79.5200, type: 'university' },
  { label: 'ISBT Dehradun, Transport Nagar', lat: 30.3275, lon: 78.0420, type: 'bus_station' },
  { label: 'Dehradun Railway Station', lat: 30.3181, lon: 78.0367, type: 'railway_station' },
  { label: 'Jolly Grant Airport, Dehradun', lat: 30.1893, lon: 78.1803, type: 'airport' },
  { label: 'Clock Tower, Rajpur Road, Dehradun', lat: 30.3255, lon: 78.0438, type: 'landmark' },
  { label: 'Rispana Bridge, Dehradun', lat: 30.3050, lon: 78.0330, type: 'landmark' },
  { label: 'Ballupur Chowk, Dehradun', lat: 30.3340, lon: 78.0120, type: 'landmark' },
  { label: 'Pacific Mall, Rajpur Road, Dehradun', lat: 30.3155, lon: 78.0002, type: 'mall' },
  { label: 'Prem Nagar, Dehradun', lat: 30.2880, lon: 78.0080, type: 'area' },
  { label: 'Clement Town, Dehradun', lat: 30.2835, lon: 78.0200, type: 'area' },
  { label: 'Sahastradhara, Dehradun', lat: 30.3872, lon: 78.1316, type: 'landmark' },
  { label: 'FRI (Forest Research Institute), Dehradun', lat: 30.3417, lon: 77.9982, type: 'university' },
  { label: 'IT Park, Sahastradhara Road, Dehradun', lat: 30.3605, lon: 78.0820, type: 'area' },
  { label: 'UPES Dehradun, Bidholi Campus', lat: 30.2780, lon: 78.0960, type: 'university' },
  { label: 'DIT University, Mussoorie Diversion', lat: 30.2665, lon: 78.0900, type: 'university' },
  { label: 'Mussoorie Mall Road, Uttarakhand', lat: 30.4598, lon: 78.0644, type: 'city' },
  { label: 'Dhanaulti, Tehri Garhwal', lat: 30.4542, lon: 78.2294, type: 'landmark' },
  { label: 'Chakrata, Dehradun District', lat: 30.7016, lon: 77.8697, type: 'city' },
  { label: 'Vikasnagar, Dehradun', lat: 30.4735, lon: 77.7712, type: 'city' },
  { label: 'Rishikesh Bus Stand, Uttarakhand', lat: 30.0869, lon: 78.2676, type: 'bus_station' },
  { label: 'Laxman Jhula, Rishikesh', lat: 30.1238, lon: 78.3274, type: 'landmark' },
  { label: 'Haridwar Railway Station / ISBT', lat: 29.9457, lon: 78.1642, type: 'railway_station' },
  { label: 'Har Ki Pauri, Haridwar', lat: 29.9567, lon: 78.1708, type: 'landmark' },
  { label: 'Roorkee Bus Stand, Uttarakhand', lat: 29.8543, lon: 77.8880, type: 'bus_station' },
  { label: 'IIT Roorkee, Uttarakhand', lat: 29.8649, lon: 77.8965, type: 'university' },
  { label: 'Haldwani Bus Station, Nainital District', lat: 29.2183, lon: 79.5130, type: 'bus_station' },
  { label: 'Pantnagar Airport / University', lat: 29.0222, lon: 79.4920, type: 'airport' },
  { label: 'Nainital Mall Road, Uttarakhand', lat: 29.3919, lon: 79.4542, type: 'city' },
  { label: 'Bhimtal Lake, Nainital District', lat: 29.3473, lon: 79.5574, type: 'landmark' },
  { label: 'Ranikhet, Almora District', lat: 29.6434, lon: 79.4322, type: 'city' },
  { label: 'Almora Town, Uttarakhand', lat: 29.5971, lon: 79.6591, type: 'city' },
  { label: 'Kausani, Bageshwar District', lat: 29.8451, lon: 79.6026, type: 'landmark' },
  { label: 'Pithoragarh City, Uttarakhand', lat: 29.5829, lon: 80.2182, type: 'city' },
  { label: 'Rudrapur, Udham Singh Nagar', lat: 28.9772, lon: 79.4005, type: 'city' },
  { label: 'Kashipur, Udham Singh Nagar', lat: 29.2104, lon: 78.9619, type: 'city' },
  { label: 'Kotdwar, Pauri Garhwal', lat: 29.7466, lon: 78.5273, type: 'city' },
  { label: 'Lansdowne, Pauri Garhwal', lat: 29.8377, lon: 78.6871, type: 'landmark' },
  { label: 'Srinagar Garhwal, Uttarakhand', lat: 30.2223, lon: 78.7844, type: 'city' },
  { label: 'Tehri Garhwal / New Tehri', lat: 30.3780, lon: 78.4320, type: 'city' },
  { label: 'Uttarkashi, Uttarakhand', lat: 30.7268, lon: 78.4432, type: 'city' },
  { label: 'Gopeshwar / Chamoli', lat: 30.4077, lon: 79.3243, type: 'city' },
  { label: 'Rudraprayag, Uttarakhand', lat: 30.2844, lon: 78.9811, type: 'city' },
];

// Build a detailed, high-precision location label from Nominatim result
const getLabel = (r) => {
  if (r.display_name) {
    const parts = r.display_name?.split(',').map(s => s.trim()) || [];
    if (parts.length >= 3) return parts.slice(0, 4).join(', ');
    if (parts.length >= 2) return parts.slice(0, 3).join(', ');
    return parts[0];
  }
  return r.label || `${parseFloat(r.lat).toFixed(4)}, ${parseFloat(r.lon).toFixed(4)}`;
};

const LocationSearch = ({ placeholder, onSelect }) => {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  // Instant local suggestions + Nominatim geocoding
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim().toLowerCase();

    // Instant local matching from popular Uttarakhand dictionary
    const localMatches = q.length >= 1
      ? POPULAR_UTTARAKHAND_LOCATIONS.filter(item => item.label.toLowerCase().includes(q))
      : POPULAR_UTTARAKHAND_LOCATIONS.slice(0, 8); // default top picks when clicking input

    setResults(localMatches);

    if (!q || q.length < 2) return;

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        // Broad viewbox covering ALL of Uttarakhand & India
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '10',
          countrycodes: 'in',
          addressdetails: '1',
          dedupe: '1',
          viewbox: '77.0,28.5,81.5,31.8',
          bounded: '0',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        const data = await res.json();
        
        // Combine local matches + Nominatim data, avoiding duplicates
        const combined = [...localMatches];
        data.forEach(item => {
          const itemLabel = getLabel(item);
          if (!combined.some(c => c.label.toLowerCase() === itemLabel.toLowerCase())) {
            combined.push(item);
          }
        });
        setResults(combined);
      } catch { }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (r) => {
    const label = getLabel(r);
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon || r.lng);
    onSelect({ lat, lng, label });
    setQuery(label);
    setResults([]);
    setFocused(false);
  };

  // Type icon based on Nominatim class
  const getIcon = (r) => {
    const t = r.type || '';
    if (t.includes('station') || t.includes('railway') || t.includes('halt')) return '🚂';
    if (t.includes('aerodrome') || t.includes('airport')) return '✈️';
    if (t.includes('bus')) return '🚌';
    if (t.includes('university') || t.includes('college') || t.includes('school')) return '🎓';
    if (t.includes('hospital') || t.includes('clinic')) return '🏥';
    if (t.includes('restaurant') || t.includes('cafe')) return '🍽️';
    if (t.includes('hotel') || t.includes('hostel')) return '🏨';
    return '📍';
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {loading && <span style={styles.loader} />}
      </div>
      {focused && results.length > 0 && (
        <div style={styles.dropdown}>
          {results.map((r, i) => {
            const mainText = r.label || (r.display_name ? r.display_name.split(',').slice(0, 3).join(', ') : '');
            const subText = r.display_name ? r.display_name.split(',').slice(3, 6).join(', ') : (r.type ? `${r.type.toUpperCase().replace('_', ' ')} • Uttarakhand` : 'Uttarakhand');

            return (
              <div
                key={i}
                style={styles.item}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => handleSelect(r)}
              >
                <span style={styles.pin}>{getIcon(r)}</span>
                <div style={styles.itemText}>
                  <span style={styles.itemMain}>
                    {mainText}
                  </span>
                  <span style={styles.itemSub}>
                    {subText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  row: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  loader: {
    position: 'absolute',
    right: '12px',
    width: '14px',
    height: '14px',
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    zIndex: 1000,
    maxHeight: '240px',
    overflowY: 'auto',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    marginTop: '4px',
    animation: 'fadeInUp 0.2s ease',
  },
  item: {
    padding: '0.7rem 0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
  },
  pin: {
    fontSize: '0.85rem',
    marginTop: '2px',
    flexShrink: 0,
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden',
  },
  itemMain: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default LocationSearch;
