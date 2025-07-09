// FAQ.js
import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const faqData = [
    {
      question: "How do I book a metro ticket?",
      answer: "Use our website or mobile app to select your route, time, and make payment."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI, net banking, and mobile wallets."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, tickets can be cancelled up to 1 hour before departure with a full refund."
    },
    {
      question: "Are there discounts for frequent travelers?",
      answer: "Yes, we offer monthly passes and loyalty programs with up to 20% savings."
    },
    {
      question: "How do I access my tickets after booking?",
      answer: "Tickets are available in your account dashboard and will be emailed to you. QR codes can be scanned directly from your phone."
    }
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Metro Booking FAQs</h2>
      <p style={styles.subtitle}>Find answers to common questions about our services</p>
      
      <div style={styles.faqContainer}>
        {faqData.map((item, index) => (
          <div 
            key={index}
            style={{
              ...styles.item,
              borderLeft: activeIndex === index 
                ? '3px solid rgba(102, 149, 252, 0.18)' 
                : '3px solid transparent'
            }}
          >
            <div 
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              style={{
                ...styles.question,
                backgroundColor: 
                  activeIndex === index ? 'rgba(85, 138, 252, 0.15)' :
                  hoverIndex === index ? 'rgba(255, 255, 255, 0.08)' : 'rgb(38, 44, 52)'
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              aria-expanded={activeIndex === index}
              aria-controls={`answer-${index}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveIndex(activeIndex === index ? null : index)}
            >
              <h3 style={styles.questionText}>{item.question}</h3>
              <div style={styles.iconContainer}>
                <div style={{
                  ...styles.iconLine,
                  transform: activeIndex === index ? 'rotate(90deg)' : 'none'
                }} />
                <div style={{
                  ...styles.iconLine,
                  transform: activeIndex === index ? 'rotate(180deg)' : 'none',
                  opacity: activeIndex === index ? 0 : 1
                }} />
              </div>
            </div>
            
            <div 
              id={`answer-${index}`}
              style={{
                ...styles.answerContainer,
                maxHeight: activeIndex === index ? '500px' : '0',
                opacity: activeIndex === index ? 1 : 0
              }}
            >
              <div style={styles.answer}>
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    width: '90%',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: 'rgba(30, 35, 42, 0.95)',
    borderRadius: '16px',
    color: '#ffffff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    color: 'rgb(87, 150, 252)',
    textAlign: 'center',
    marginBottom: '0.5rem',
    fontSize: '2rem',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '2rem',
    fontSize: '1.1rem'
  },
  faqContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  item: {
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  question: {
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    borderRadius: '12px',
  },
  questionText: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '500',
    flex: 1,
    paddingRight: '1rem'
  },
  iconContainer: {
    position: 'relative',
    width: '24px',
    height: '24px',
    minWidth: '24px'
  },
  iconLine: {
    position: 'absolute',
    width: '16px',
    height: '2px',
    backgroundColor: 'rgb(87, 150, 252)',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.3s ease'
  },
  answerContainer: {
    maxHeight: '0',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 0
  },
  answer: {
    padding: '0 1.25rem 1.25rem',
    backgroundColor: 'rgba(25, 30, 38, 0.5)',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: '1.6'
  }
};

export default FAQ;