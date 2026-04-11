import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.welcome}>Welcome, {user?.name}</h2>
      <p style={styles.sub}>What would you like to do today?</p>
      <div style={styles.cards}>
        <div style={styles.card} onClick={() => navigate('/offer-ride')}>
          <div style={styles.icon}></div>
          <h3 style={styles.cardTitle}>Offer a Ride</h3>
          <p style={styles.cardSub}>Post your route and earn credits</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/find-ride')}>
          <div style={styles.icon}></div>
          <h3 style={styles.cardTitle}>Find a Ride</h3>
          <p style={styles.cardSub}>Search for rides on your route</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/my-rides')}>
            <div style={styles.icon}></div>
            <h3 style={styles.cardTitle}>My Rides</h3>
            <p style={styles.cardSub}>View offered and booked rides</p>
        </div>
      </div>
      <div style={styles.wallet}>
        <span>Your credits: </span>
        <strong style={styles.credits}>{user?.credits ?? 0}</strong>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '700px', margin: '3rem auto', padding: '0 1rem', textAlign: 'center' },
  welcome:   { color: '#1E3A5F', fontSize: '1.8rem', marginBottom: '0.5rem' },
  sub:       { color: '#666', marginBottom: '2.5rem' },
  cards:     { display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' },
  card:      { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '16px', padding: '2rem 2.5rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minWidth: '200px' },
  icon:      { fontSize: '2.5rem', marginBottom: '0.8rem' },
  cardTitle: { color: '#1E3A5F', marginBottom: '0.4rem' },
  cardSub:   { color: '#888', fontSize: '0.85rem' },
  wallet:    { marginTop: '2.5rem', fontSize: '1rem', color: '#555' },
  credits:   { color: '#2ecc71', fontSize: '1.3rem', marginLeft: '0.4rem' }
};

export default Dashboard;