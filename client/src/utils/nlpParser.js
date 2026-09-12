// NLP Parser for ride search queries
// Parses natural language like "ride from GEU to ISBT tomorrow 9am"

// Known locations dictionary with coordinates (Dehradun area)
const LOCATIONS = {
  'geu':                      { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University, Dehradun' },
  'graphic era':              { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University, Dehradun' },
  'graphic era university':    { lat: 30.2729, lng: 78.0687, label: 'Graphic Era University, Dehradun' },
  'gehu':                     { lat: 30.2735, lng: 78.0695, label: 'Graphic Era Hill University, Dehradun' },
  'graphic era hill university':{ lat: 30.2735, lng: 78.0695, label: 'Graphic Era Hill University, Dehradun' },
  'isbt':                     { lat: 30.3275, lng: 78.0420, label: 'ISBT Dehradun, Transport Nagar' },
  'isbt dehradun':            { lat: 30.3275, lng: 78.0420, label: 'ISBT Dehradun, Transport Nagar' },
  'railway station':          { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'dehradun railway station': { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'station':                  { lat: 30.3181, lng: 78.0367, label: 'Dehradun Railway Station' },
  'airport':                  { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport, Dehradun' },
  'jolly grant':              { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport, Dehradun' },
  'dehradun airport':         { lat: 30.1893, lng: 78.1803, label: 'Jolly Grant Airport, Dehradun' },
  'clock tower':              { lat: 30.3255, lng: 78.0438, label: 'Clock Tower, Rajpur Road, Dehradun' },
  'ghanta ghar':              { lat: 30.3255, lng: 78.0438, label: 'Clock Tower, Rajpur Road, Dehradun' },
  'rispana':                  { lat: 30.3050, lng: 78.0330, label: 'Rispana Bridge, Dehradun' },
  'rajpur road':              { lat: 30.3340, lng: 78.0590, label: 'Rajpur Road, Dehradun' },
  'rajpur':                   { lat: 30.3340, lng: 78.0590, label: 'Rajpur Road, Dehradun' },
  'paltan bazaar':            { lat: 30.3180, lng: 78.0390, label: 'Paltan Bazaar, Dehradun' },
  'paltan bazar':             { lat: 30.3180, lng: 78.0390, label: 'Paltan Bazaar, Dehradun' },
  'pacific mall':             { lat: 30.3155, lng: 78.0002, label: 'Pacific Mall, Rajpur Road, Dehradun' },
  'pacific':                  { lat: 30.3155, lng: 78.0002, label: 'Pacific Mall, Rajpur Road, Dehradun' },
  'prem nagar':               { lat: 30.2880, lng: 78.0080, label: 'Prem Nagar, Dehradun' },
  'clement town':             { lat: 30.2835, lng: 78.0200, label: 'Clement Town, Dehradun' },
  'doon hospital':            { lat: 30.3140, lng: 78.0340, label: 'Doon Hospital, Dehradun' },
  'survey chowk':             { lat: 30.3104, lng: 78.0243, label: 'Survey Chowk, Dehradun' },
  'ballupur':                 { lat: 30.3400, lng: 78.0600, label: 'Ballupur Chowk, Dehradun' },
  'sahastradhara':            { lat: 30.3900, lng: 78.1300, label: 'Sahastradhara, Dehradun' },
  'robber cave':              { lat: 30.3820, lng: 78.0750, label: 'Robbers Cave, Guchhupani, Dehradun' },
  'tapkeshwar':               { lat: 30.3610, lng: 78.0105, label: 'Tapkeshwar Temple, Dehradun' },
  'fri':                      { lat: 30.3400, lng: 78.0000, label: 'Forest Research Institute (FRI), Dehradun' },
  'forest research institute':{ lat: 30.3400, lng: 78.0000, label: 'Forest Research Institute (FRI), Dehradun' },
  'doon university':          { lat: 30.3480, lng: 78.1260, label: 'Doon University, Dehradun' },
  'dit university':           { lat: 30.2665, lng: 78.0900, label: 'DIT University, Mussoorie Diversion' },
  'upes':                     { lat: 30.2780, lng: 78.0960, label: 'UPES Dehradun, Bidholi Campus' },
  'selaqui':                  { lat: 30.3520, lng: 77.8690, label: 'Selaqui Industrial Area, Dehradun' },
  'vikasnagar':               { lat: 30.4720, lng: 77.7730, label: 'Vikasnagar, Dehradun' },
  'doiwala':                  { lat: 30.1800, lng: 78.1100, label: 'Doiwala, Dehradun' },
  'mussoorie':                { lat: 30.4598, lng: 78.0644, label: 'Mussoorie, Uttarakhand' },
  'rishikesh':                { lat: 30.0869, lng: 78.2676, label: 'Rishikesh, Uttarakhand' },
  'haridwar':                 { lat: 29.9457, lng: 78.1642, label: 'Haridwar, Uttarakhand' },
  'roorkee':                  { lat: 29.8543, lng: 77.8880, label: 'Roorkee, Uttarakhand' },
  'iit roorkee':              { lat: 29.8649, lng: 77.8965, label: 'IIT Roorkee, Uttarakhand' },
  'haldwani':                 { lat: 29.2183, lng: 79.5130, label: 'Haldwani, Nainital District' },
  'nainital':                 { lat: 29.3919, lng: 79.4542, label: 'Nainital, Uttarakhand' },
  'almora':                   { lat: 29.5971, lng: 79.6591, label: 'Almora, Uttarakhand' },
  'pithoragarh':              { lat: 29.5829, lng: 80.2182, label: 'Pithoragarh, Uttarakhand' },
  'rudrapur':                 { lat: 28.9772, lng: 79.4005, label: 'Rudrapur, Udham Singh Nagar' },
  'kashipur':                 { lat: 29.2104, lng: 78.9619, label: 'Kashipur, Udham Singh Nagar' },
  'kotdwar':                  { lat: 29.7460, lng: 78.5273, label: 'Kotdwar, Pauri Garhwal' },
  'pauri':                    { lat: 30.1500, lng: 78.7800, label: 'Pauri Garhwal, Uttarakhand' },
  'srinagar':                 { lat: 30.2223, lng: 78.7844, label: 'Srinagar Garhwal, Uttarakhand' },
  'tehri':                    { lat: 30.3780, lng: 78.4320, label: 'New Tehri, Uttarakhand' },
  'uttarkashi':               { lat: 30.7268, lng: 78.4354, label: 'Uttarkashi, Uttarakhand' },
  'chamoli':                  { lat: 30.4000, lng: 79.3300, label: 'Chamoli, Uttarakhand' },
  'gopeshwar':                { lat: 30.4100, lng: 79.3300, label: 'Gopeshwar, Chamoli' },
  'rudraprayag':              { lat: 30.2844, lng: 78.9811, label: 'Rudraprayag, Uttarakhand' },
  'badrinath':                { lat: 30.7433, lng: 79.4938, label: 'Badrinath, Chamoli' },
  'kedarnath':                { lat: 30.7346, lng: 79.0669, label: 'Kedarnath, Rudraprayag' },
  'ranikhet':                 { lat: 29.6434, lng: 79.4322, label: 'Ranikhet, Almora' },
  'kausani':                  { lat: 29.8443, lng: 79.6039, label: 'Kausani, Bageshwar' },
  'bageshwar':                { lat: 29.8400, lng: 79.7700, label: 'Bageshwar, Uttarakhand' },
  'champawat':                { lat: 29.3300, lng: 80.1000, label: 'Champawat, Uttarakhand' },
  'ramnagar':                 { lat: 29.3900, lng: 79.1200, label: 'Ramnagar, Nainital' },
  'jim corbett':              { lat: 29.5300, lng: 78.7700, label: 'Jim Corbett National Park' },
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
    // If time parsed today is already in the past, assume user meant tomorrow
    if (!isTomorrow && date < now) {
      date.setDate(date.getDate() + 1);
    }
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
      // Use 4 components for a precise detailed landmark label
      const label = data[0].display_name.split(',').slice(0, 4).join(', ').trim();
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
