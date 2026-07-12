import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovingCars from '../components/MovingCars';

const faqs = [
  { q: 'Who can use RidePool GEU?', a: 'Only verified Graphic Era University students with a valid college ID can register and use the platform.' },
  { q: 'Is ride-pooling free?', a: 'Yes! Booking a ride costs zero credits. Drivers earn credits for offering rides and completing them with passengers.' },
  { q: 'Can I book my own ride?', a: 'No, self-booking is not allowed. You can only book rides offered by other students.' },
  { q: 'How does the Smart Search work?', a: 'Type a natural language query like "GEU to ISBT tomorrow 9am" and our NLP parser auto-fills the pickup, drop, and time fields.' },
  { q: 'How does the rating system work?', a: 'After a ride is completed, both driver and passengers can rate each other (1-5 stars). Your profile shows a running average.' },
  { q: 'How do credits work?', a: 'Drivers earn credits when they complete rides with passengers. Credits reflect your contribution to the ride-sharing community.' },
  { q: 'Is the chat private?', a: 'Yes. Each ride has its own chat room. Only the driver and booked passengers of that specific ride can see the messages.' },
  { q: 'How does Route Optimization work?', a: 'Drivers with multiple bookings can click "Optimize Pickup Order" to see the most efficient pickup sequence using nearest-neighbor algorithm.' },
  { q: 'What if the driver cancels?', a: 'All booked passengers are notified via email and their bookings are automatically cancelled. Seats are restored.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your personal email, and follow the reset link sent to your inbox.' },
];

const Help = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div style={styles.page}>
      <MovingCars count={5} />
      <div style={styles.container}>

        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>

        <h1 style={styles.title}>Help & Support</h1>
        <p style={styles.subtitle}>Everything you need to know about RidePool GEU</p>

        {/* FAQ Accordion */}
        <div style={styles.faqSection}>
          <h3 style={styles.sectionTitle}>❓ Frequently Asked Questions</h3>
          {faqs.map((faq, i) => (
            <div key={i} style={styles.faqItem}>
              <button
                style={styles.faqQ}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span style={{ ...styles.faqArrow, transform: openIdx === i ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {openIdx === i && (
                <div style={styles.faqA}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={styles.contactCard}>
          <h3 style={styles.sectionTitle}>📬 Contact Us</h3>
          <div style={styles.contactGrid}>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📧</span>
              <div>
                <p style={styles.contactLabel}>Email</p>
                <p style={styles.contactValue}>ridepool.geu@gmail.com</p>
              </div>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>🏫</span>
              <div>
                <p style={styles.contactLabel}>Location</p>
                <p style={styles.contactValue}>Graphic Era University, Dehradun</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick tips */}
        <div style={styles.tipsCard}>
          <h3 style={styles.sectionTitle}>💡 Quick Tips</h3>
          <div style={styles.tipsList}>
            <div style={styles.tip}>
              <span style={styles.tipBullet}>●</span>
              <span>Use the 🧠 Smart Search to quickly fill ride details</span>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipBullet}>●</span>
              <span>Rate your rides — it helps build trust in the community</span>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipBullet}>●</span>
              <span>Chat with your ride group to coordinate pickup points</span>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipBullet}>●</span>
              <span>Drivers: use Route Optimization with multiple bookings</span>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipBullet}>●</span>
              <span>Keep your personal email updated for password resets</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem 1rem', position: 'relative' },
  container: { maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1, animation: 'fadeIn 0.4s ease' },
  backBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'all 0.2s' },
  title: { fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.3rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },

  faqSection: { marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.15s forwards', opacity: 0 },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' },
  faqItem: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', overflow: 'hidden' },
  faqQ: { width: '100%', padding: '0.9rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  faqArrow: { color: 'var(--accent)', fontSize: '0.7rem', transition: 'transform 0.3s ease', flexShrink: 0 },
  faqA: { padding: '0 1rem 0.9rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '0.8rem', animation: 'fadeIn 0.3s ease' },

  contactCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.25s forwards', opacity: 0 },
  contactGrid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  contactIcon: { fontSize: '1.3rem' },
  contactLabel: { fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  contactValue: { fontSize: '0.9rem', fontWeight: '600' },

  tipsCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.35s forwards', opacity: 0 },
  tipsList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  tip: { display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', alignItems: 'flex-start' },
  tipBullet: { color: 'var(--accent)', flexShrink: 0, marginTop: '1px' },
};

export default Help;
