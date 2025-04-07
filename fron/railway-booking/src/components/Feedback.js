import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Feedback.css';

const FeedbackForm = ({ trainId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ totalFeedback: 0, averageRating: 0 });

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`/api/trains/${trainId}/feedback`);
        setFeedbackList(response.data.feedback);
        setStats(response.data.stats);
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
      }
    };
    
    fetchFeedback();
  }, [trainId, submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/feedback', {
        trainId,
        rating,
        comments
      });
      
      setSubmitted(true);
      setError('');
      setComments('');
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
      console.error('Feedback submission error:', err);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <h3>Thank you for your feedback!</h3>
        <p>Your rating helps us improve our service.</p>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-stats">
        <h3>Train Feedback</h3>
        <div className="rating-summary">
          <span className="average-rating">{stats.averageRating || '0.0'}</span>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < Math.floor(stats.averageRating) ? 'filled' : ''}`}>★</span>
            ))}
          </div>
          <span className="total-feedback">{stats.totalFeedback} reviews</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <h4>Share Your Experience</h4>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Comments:</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share details about your experience..."
            rows="4"
          />
        </div>
        
        <button type="submit" className="submit-btn">
          Submit Feedback
        </button>
      </form>

      <div className="feedback-list">
        <h4>Recent Feedback</h4>
        {feedbackList.length === 0 ? (
          <p>No feedback yet. Be the first to review!</p>
        ) : (
          feedbackList.map((item) => (
            <div key={item.id} className="feedback-item">
              <div className="feedback-header">
                <span className="username">{item.username}</span>
                <div className="item-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < item.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
              </div>
              {item.comments && <p className="comments">{item.comments}</p>}
              <div className="feedback-date">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;