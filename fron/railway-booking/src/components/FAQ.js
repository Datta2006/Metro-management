import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book a metro ticket?",
      answer: "Visit our website or app, select your route, choose travel time, and complete payment."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit/debit cards, UPI, net banking, and metro smart cards."
    },
    {
      question: "Can I get a refund if I cancel?",
      answer: "Yes, cancellations made at least 1 hour before departure receive full refunds."
    }
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1.5rem',
      background: '#0a0a12',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{
        color: '#3d7bff',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontSize: '1.8rem'
      }}>
        Metro Booking FAQs
      </h2>
      
      {faqs.map((faq, index) => (
        <div 
          key={index}
          style={{
            marginBottom: '0.75rem',
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            background: '#12121d',
            borderLeft: `3px solid ${activeIndex === index ? '#3d7bff' : 'transparent'}`
          }}
        >
          <div 
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            style={{
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeIndex === index ? '#1a1a2a' : '#12121d',
              '&:hover': {
                background: '#1a1a2a'
              }
            }}
          >
            <h3 style={{
              color: '#f0f0f0',
              margin: 0,
              fontSize: '1.1rem'
            }}>
              {faq.question}
            </h3>
            <span style={{
              color: '#3d7bff',
              fontSize: '1.3rem',
              transition: 'transform 0.3s ease',
              transform: activeIndex === index ? 'rotate(180deg)' : 'none'
            }}>
              {activeIndex === index ? '−' : '+'}
            </span>
          </div>
          
          <div style={{
            maxHeight: activeIndex === index ? '500px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.4s ease',
            color: '#cccccc',
            background: '#1a1a2a'
          }}>
            <div style={{ padding: '1rem' }}>
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;