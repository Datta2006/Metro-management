import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book a metro ticket?",
      answer: "Select your stations, choose travel time, and pay online."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit/debit cards, UPI, and mobile wallets."
    },
    {
      question: "Can I cancel my ticket?",
      answer: "Yes, cancellations are allowed up to 1 hour before departure."
    }
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '25px',
      backgroundColor: '#0A0A12',
      borderRadius: '12px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
    }}>
      <h2 style={{
        color: '#3D7BFF',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '1.8rem',
        textShadow: '0 2px 4px rgba(61,123,255,0.3)'
      }}>
        Frequently Asked Questions
      </h2>
      
      {faqs.map((faq, index) => (
        <div 
          key={index}
          style={{
            marginBottom: '15px',
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            transform: hoveredIndex === index ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredIndex === index ? '0 6px 12px rgba(61,123,255,0.2)' : '0 2px 6px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div 
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            style={{
              padding: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: activeIndex === index ? '#1A1A2A' : '#12121D',
              transition: 'all 0.3s ease',
              borderLeft: `4px solid ${hoveredIndex === index ? '#3D7BFF' : 'transparent'}`
            }}
          >
            <h3 style={{
              color: '#F0F0F0',
              margin: 0,
              fontSize: '1.1rem',
              transition: 'all 0.2s ease',
              transform: hoveredIndex === index ? 'translateX(5px)' : 'none'
            }}>
              {faq.question}
            </h3>
            <span style={{
              color: '#3D7BFF',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              transition: 'transform 0.3s ease',
              transform: activeIndex === index ? 'rotate(180deg)' : 'none'
            }}>
              {activeIndex === index ? '−' : '+'}
            </span>
          </div>
          
          <div style={{
            maxHeight: activeIndex === index ? '200px' : '0',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#1A1A2A'
          }}>
            <div style={{
              padding: activeIndex === index ? '18px' : '0 18px',
              color: '#CCCCCC',
              borderTop: '1px solid #252538',
              opacity: activeIndex === index ? 1 : 0,
              transition: 'opacity 0.2s ease, padding 0.3s ease'
            }}>
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;