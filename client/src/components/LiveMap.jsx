import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
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

const PanToDriver = ({ pos }) => {
  const map = useMap();
  useEffect(() => { if (pos) map.panTo(pos, { animate: true }); }, [pos]);
  return null;
};

const LiveMap = ({ rideId, ride, height = '400px' }) => {
  const socketRef   = useRef(null);
  const [driverPos, setDriverPos]   = useState(null);
  const [rideActive, setRideActive] = useState(false);
  const [route, setRoute]           = useState(null);

  useEffect(() => {
    // Fetch OSRM route
    const fetchRoute = async () => {
      try {
        const { origin, destination } = ride;
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          setRoute(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        }
      } catch { }
    };
    fetchRoute();

    // Connect socket
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('passenger:join', { rideId });

    socketRef.current.on('ride:started', () => setRideActive(true));
    socketRef.current.on('driver:location', ({ lat, lng }) => {
      setDriverPos([lat, lng]);
      setRideActive(true);
    });

    return () => socketRef.current?.disconnect();
  }, [rideId]);

  const center = [ride.origin.latitude, ride.origin.longitude];

  return (
    <div>
      {rideActive && (
        <div style={styles.liveBanner}>
          <span style={styles.liveDot} />
          Driver is on the way — live location active
        </div>
      )}
      {!rideActive && (
        <div style={styles.waitBanner}>
          Waiting for driver to start the ride...
        </div>
      )}
      <MapContainer center={center} zoom={14}
        style={{ height, width: '100%', borderRadius: 'var(--radius-md)' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
        {route && <Polyline positions={route} color="#e63946" weight={4} opacity={0.8} />}
        <Marker position={[ride.origin.latitude, ride.origin.longitude]} icon={originIcon}>
          <Popup>Origin: {ride.origin.label}</Popup>
        </Marker>
        <Marker position={[ride.destination.latitude, ride.destination.longitude]} icon={destIcon}>
          <Popup>Destination: {ride.destination.label}</Popup>
        </Marker>
        {driverPos && (
          <>
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>🚗 Driver is here</Popup>
            </Marker>
            <PanToDriver pos={driverPos} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

const styles = {
  liveBanner:  { background: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  liveDot:     { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' },
  waitBanner:  { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.8rem', fontSize: '0.85rem' }
};

export default LiveMap;