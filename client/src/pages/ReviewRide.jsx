import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ReviewRide = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/rides/${rideId}`);
        setRide(res.data.ride);

        // Determine who to review
        const me = JSON.parse(localStorage.getItem('ridepool_user'));
        if (res.data.ride.driverId._id === me?.id || res.data.ride.driverId._id === me?._id) {
          // I'm the driver — will review passengers (for now, first passenger)
          setReviewTarget(null); // Driver selects from passengers
        } else {
          // I'm a passenger — review the driver
          setReviewTarget(res.data.ride.driverId);
        }

        // Check if already reviewed
        const checkRes = await API.get(`/reviews/ride/${rideId}/check`);
        if (checkRes.data.reviewed) setAlreadyReviewed(true);
      } catch (err) {
        setError('Failed to load ride.');
      }
    };
    fetchRide();
  }, [rideId]);

  const handleSubmit = async () => {
    if (!rating || !reviewTarget) return setError('Please select a rating.');
    setLoading(true);
    setError('');
    try {
      await API.post('/reviews', {
        rideId,
        toUserId: reviewTarget._id,
        rating,
        comment
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Review Submitted!</h2>
          <p style={styles.successText}>Thank you for your feedback.</p>
          <button style={styles.backBtn} onClick={() => navigate('/my-rides')}>← Back to My Rides</button>
        </div>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Already Reviewed</h2>
          <p style={styles.successText}>You've already submitted a review for this ride.</p>
          <button style={styles.backBtn} onClick={() => navigate('/my-rides')}>← Back to My Rides</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.navBtn} onClick={() => navigate('/my-rides')}>← Back</button>
        <h2 style={styles.title}>Rate Your Ride ⭐</h2>

        {ride && (
          <div style={styles.rideInfo}>
            <p style={styles.route}>{ride.origin?.label} → {ride.destination?.label}</p>
            <p style={styles.meta}>
              {new Date(ride.departureTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {reviewTarget && (
          <div style={styles.targetCard}>
            <div style={styles.avatar}>{reviewTarget.name?.charAt(0)}</div>
            <div>
              <p style={styles.targetName}>{reviewTarget.name}</p>
              <p style={styles.targetRole}>Driver</p>
            </div>
          </div>
        )}

        {/* Stars */}
        <div style={styles.starsSection}>
          <p style={styles.starsLabel}>How was your experience?</p>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                style={{
                  ...styles.star,
                  color: star <= (hover || rating) ? '#f59e0b' : '#2a2a3e',
                  transform: star <= (hover || rating) ? 'scale(1.2)' : 'scale(1)',
                }}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <p style={styles.ratingText}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Great'}
            {rating === 5 && 'Excellent!'}
          </p>
        </div>

        {/* Comment */}
        <div style={styles.commentSection}>
          <label style={styles.commentLabel}>Leave a comment (optional)</label>
          <textarea
            style={styles.textarea}
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
          />
          <span style={styles.charCount}>{comment.length}/500</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{ ...styles.submitBtn, opacity: !rating ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={loading || !rating}
        >
          {loading ? 'Submitting...' : 'Submit Review ⭐'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' },
  container: { maxWidth: '480px', width: '100%', animation: 'fadeIn 0.4s ease' },
  navBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'all 0.2s' },
  title: { fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease forwards', opacity: 0 },

  rideInfo: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.2rem', marginBottom: '1.2rem', animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 },
  route: { fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.3rem' },
  meta: { color: 'var(--text-muted)', fontSize: '0.82rem' },

  targetCard: { display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.2rem', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.2s forwards', opacity: 0 },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '700' },
  targetName: { fontWeight: '700', fontSize: '0.95rem' },
  targetRole: { color: 'var(--text-muted)', fontSize: '0.78rem' },

  starsSection: { textAlign: 'center', marginBottom: '1.5rem', animation: 'fadeInUp 0.5s ease 0.3s forwards', opacity: 0 },
  starsLabel: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.8rem' },
  stars: { display: 'flex', justifyContent: 'center', gap: '0.5rem' },
  star: { background: 'transparent', border: 'none', fontSize: '2.8rem', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', lineHeight: 1 },
  ratingText: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.5rem', minHeight: '1.3rem' },

  commentSection: { marginBottom: '1.2rem', position: 'relative', animation: 'fadeInUp 0.5s ease 0.4s forwards', opacity: 0 },
  commentLabel: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' },
  textarea: { width: '100%', minHeight: '100px', padding: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border 0.3s', boxSizing: 'border-box' },
  charCount: { position: 'absolute', bottom: '0.5rem', right: '0.7rem', fontSize: '0.7rem', color: 'var(--text-muted)' },

  error: { background: 'var(--red-soft)', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' },
  submitBtn: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)', animation: 'fadeInUp 0.5s ease 0.5s forwards', opacity: 0, transition: 'opacity 0.3s' },

  successCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', maxWidth: '420px', animation: 'fadeIn 0.5s ease' },
  successIcon: { fontSize: '3rem', marginBottom: '1rem' },
  successTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' },
  successText: { color: 'var(--text-muted)', marginBottom: '1.5rem' },
  backBtn: { background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
};

export default ReviewRide;
