// FAQ.js
import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "How do I book a metro ticket?",
      answer: "Use our website or mobile app to select your route, time, and make payment."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI, and net banking."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, tickets can be cancelled up to 1 hour before departure."
    }
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Metro Booking FAQs</h2>
      
      {faqData.map((item, index) => (
        <div 
          key={index}
          style={{
            ...styles.item,
            borderLeft: activeIndex === index ? '3px solid #3d7bff' : '3px solid transparent'
          }}
        >
          <div 
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            style={styles.question}
          >
            <h3 style={styles.questionText}>{item.question}</h3>
            <span style={styles.icon}>
              {activeIndex === index ? '−' : '+'}
            </span>
          </div>
          
          {activeIndex === index && (
            <div style={styles.answer}>
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '1.5rem',
    backgroundColor: '#0a0a12',
    borderRadius: '8px',
    color: '#ffffff'
  },
  title: {
    color: '#3d7bff',
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  item: {
    marginBottom: '0.75rem',
    backgroundColor: '#12121d',
    borderRadius: '4px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  question: {
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#12121d',
    transition: 'background-color 0.2s ease'
  },
  questionText: {
    margin: 0,
    fontSize: '1.1rem'
  },
  icon: {
    color: '#3d7bff',
    fontSize: '1.3rem',
    fontWeight: 'bold'
  },
  answer: {
    padding: '1rem',
    backgroundColor: '#1a1a2a',
    color: '#cccccc',
    borderTop: '1px solid #252538'
  }
};

export default FAQ;