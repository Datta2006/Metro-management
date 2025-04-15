import React, { useState } from 'react';
import './Feedback1.css';

const Feedback = () => {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() === '') return;
    console.log('Feedback:', { comment, rating });
    setSubmitted(true);
  };

  const resetFeedback = () => {
    setComment('');
    setRating(0);
    setSubmitted(false);
  };

  return (
    <div className="feedback-container">
      {submitted ? (
        <div className="feedback-success">
          <div className="success-icon">✓</div>
          <p className="success-message">Feedback received</p>
          <button 
            onClick={resetFeedback}
            className="reset-btn"
          >
            New Feedback
          </button>
        </div>
      ) : (
        <>
          <h3 className="feedback-title">TELL US WHAT YOU THINK</h3>
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Be brutally honest..."
              rows="4"
              required
              className="feedback-textarea"
            />
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={comment.trim() === ''}
            >
              SEND
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Feedback;