// NLP Parser for ride search queries
// Parses natural language like "ride from GEU to ISBT tomorrow 9am"

// Known locations dictionary with coordinates (Dehradun area)
const LOCATIONS = {
  'geu':              { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University' },
  'graphic era':      { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University' },
  'graphic era university': { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University' },
  'isbt':             { lat: 30.3275, lng: 78.0420, label: 'ISBT Dehradun' },
  'isbt dehradun':    { lat: 30.3275, lng: 78.0420, label: 'ISBT Dehradun' },
  'railway station':  { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'dehradun railway station': { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'station':          { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'airport':          { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport' },
  'jolly grant':      { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport' },
  'dehradun airport': { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport' },
  'clock tower':      { lat: 30.3255, lng: 78.0438, label: 'Clock Tower, Dehradun' },
  'ghanta ghar':      { lat: 30.3255, lng: 78.0438, label: 'Clock Tower, Dehradun' },
  'rispana':          { lat: 30.3050, lng: 78.0330, label: 'Rispana Bridge' },
  'rajpur road':      { lat: 30.3340, lng: 78.0590, label: 'Rajpur Road' },
  'rajpur':           { lat: 30.3340, lng: 78.0590, label: 'Rajpur Road' },
  'paltan bazaar':    { lat: 30.3180, lng: 78.0390, label: 'Paltan Bazaar' },
  'paltan bazar':     { lat: 30.3180, lng: 78.0390, label: 'Paltan Bazaar' },
  'pacific mall':     { lat: 30.3155, lng: 78.0002, label: 'Pacific Mall, Dehradun' },
  'pacific':          { lat: 30.3155, lng: 78.0002, label: 'Pacific Mall, Dehradun' },
  'mussoorie':        { lat: 30.4598, lng: 78.0644, label: 'Mussoorie' },
  'prem nagar':       { lat: 30.2880, lng: 78.0080, label: 'Prem Nagar' },
  'clement town':     { lat: 30.2835, lng: 78.0200, label: 'Clement Town' },
  'doon hospital':    { lat: 30.3140, lng: 78.0340, label: 'Doon Hospital' },
  'survey chowk':     { lat: 30.3104, lng: 78.0243, label: 'Survey Chowk' },
  'ballupur':         { lat: 30.3400, lng: 78.0600, label: 'Ballupur Chowk' },
  'sahastradhara':    { lat: 30.3900, lng: 78.1300, label: 'Sahastradhara' },
  'robber cave':      { lat: 30.3820, lng: 78.0750, label: 'Robbers Cave' },
  'tapkeshwar':       { lat: 30.3610, lng: 78.0105, label: 'Tapkeshwar Temple' },
  'fri':              { lat: 30.3400, lng: 78.0000, label: 'Forest Research Institute' },
  'forest research institute': { lat: 30.3400, lng: 78.0000, label: 'Forest Research Institute' },
  'doon university':  { lat: 30.3480, lng: 78.1260, label: 'Doon University' },
  'dit university':   { lat: 30.2665, lng: 78.0900, label: 'DIT University' },
  'upes':             { lat: 30.2780, lng: 78.0960, label: 'UPES Dehradun' },
  'selaqui':          { lat: 30.3520, lng: 77.8690, label: 'Selaqui' },
  'rishikesh':        { lat: 30.0869, lng: 78.2676, label: 'Rishikesh' },
  'haridwar':         { lat: 29.9457, lng: 78.1642, label: 'Haridwar' },
};

// Parse time from natural language
const parseTime = (text) => {
  const now = new Date();
  const lower = text.toLowerCase();

  // "tomorrow"
  const isTomorrow = /tomorrow/.test(lower);
  const isToday = /today/.test(lower);

  // Extract hour
  const timeMatch = lower.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/i);
  let hours = null, minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1]);
    minutes = parseInt(timeMatch[2] || '0');
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  }

  // Named times
  if (!hours && /morning/.test(lower)) hours = 9;
  if (!hours && /afternoon/.test(lower)) hours = 14;
  if (!hours && /evening/.test(lower)) hours = 18;
  if (!hours && /night/.test(lower)) hours = 21;

  if (hours === null && !isTomorrow && !isToday) return null;

  const date = new Date(now);
  if (isTomorrow) date.setDate(date.getDate() + 1);
  if (hours !== null) {
    date.setHours(hours, minutes, 0, 0);
  }

  // Format as datetime-local value
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Find a location in text
const findLocation = (text) => {
  const lower = text.toLowerCase().trim();
  // Sort keys by length descending to match longest first
  const keys = Object.keys(LOCATIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      const loc = LOCATIONS[key];
      return { lat: loc.lat, lng: loc.lng, label: loc.label, matchedKey: key };
    }
  }
  return null;
};

// Geocode fallback for unknown locations anywhere in India
const geocodeFallback = async (text) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1&countrycodes=in`);
    const data = await res.json();
    if (data && data.length > 0) {
      // Use the first two parts of the display name for a clean label
      const label = data[0].display_name.split(',').slice(0, 2).join(',').trim();
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label, matchedKey: text };
    }
  } catch(e) {
    console.error('Geocoding failed for', text, e);
  }
  return null;
};

// Main parser
export const parseRideQuery = async (query) => {
  const lower = query.toLowerCase().trim();
  const result = { pickup: null, drop: null, time: null, understood: false };

  // Try to extract "from X to Y"
  const fromToMatch = lower.match(/(?:from\s+)(.+?)(?:\s+to\s+)(.+?)(?:\s+(?:at|around|by|tomorrow|today|morning|evening|afternoon|night|\d).*)?$/i);

  if (fromToMatch) {
    const fromText = fromToMatch[1].trim();
    const toText = fromToMatch[2].trim();
    result.pickup = findLocation(fromText) || await geocodeFallback(fromText);
    
    // For drop, need to extract just the location part (remove time words)
    const dropClean = toText.replace(/\s*(at|around|by|tomorrow|today|morning|evening|afternoon|night)\s*.*/i, '').trim();
    result.drop = findLocation(dropClean) || await geocodeFallback(dropClean) || findLocation(toText) || await geocodeFallback(toText);
  } else {
    // Try "X to Y"
    const toMatch = lower.match(/(.+?)\s+to\s+(.+?)(?:\s+(?:at|around|by|tomorrow|today|morning|evening|afternoon|night|\d).*)?$/i);
    if (toMatch) {
      const fromText = toMatch[1].trim();
      result.pickup = findLocation(fromText) || await geocodeFallback(fromText);
      
      const toText = toMatch[2].trim();
      const dropClean = toText.replace(/\s*(at|around|by|tomorrow|today|morning|evening|afternoon|night)\s*.*/i, '').trim();
      result.drop = findLocation(dropClean) || await geocodeFallback(dropClean) || findLocation(toText) || await geocodeFallback(toText);
    }
  }

  // Parse time
  result.time = parseTime(lower);

  result.understood = !!(result.pickup || result.drop);
  return result;
};

// Get all known location names for display
export const getKnownLocations = () => {
  const seen = new Set();
  return Object.entries(LOCATIONS)
    .filter(([, v]) => {
      if (seen.has(v.label)) return false;
      seen.add(v.label);
      return true;
    })
    .map(([, v]) => v.label);
};

export default { parseRideQuery, getKnownLocations };
