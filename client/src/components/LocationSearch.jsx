import { useState, useRef, useEffect } from 'react';

// Build a meaningful short label from Nominatim result
const getLabel = (r) => {
  // Use the name if available (e.g. "Dehradun Railway Station")
  const parts = r.display_name?.split(',').map(s => s.trim()) || [];
  // First part is usually the POI name, second is road/area
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0] || `${parseFloat(r.lat).toFixed(4)}, ${parseFloat(r.lon).toFixed(4)}`;
};

const LocationSearch = ({ placeholder, onSelect }) => {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  // Debounced autocomplete — fires 400ms after user stops typing
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        // viewbox biases to Uttarakhand/Dehradun region for better local results
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '7',
          countrycodes: 'in',
          addressdetails: '1',
          dedupe: '1',
          viewbox: '77.5,29.9,78.5,30.6',
          bounded: '0',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        const data = await res.json();
        setResults(data);
      } catch { }
      setLoading(false);
    }, 400);

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
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label });
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
          {results.map((r, i) => (
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
                  {r.display_name?.split(',').slice(0, 3).join(', ')}
                </span>
                <span style={styles.itemSub}>
                  {r.display_name?.split(',').slice(3, 6).join(', ')}
                </span>
              </div>
            </div>
          ))}
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
