import React, { useState } from 'react';
import './Feedback1.css';

const Feedback = () => {
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback:', comment); // Just logs to console
    setSubmitted(true);
  };

  return (
    <div className="simple-feedback">
      {submitted ? (
        <p>Thanks for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows="3"
            style={{ width: '100%' }}
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Feedback;