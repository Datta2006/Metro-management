import React from 'react';

const ImportantNotice = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2a3a4a 0%, #1e2a3a 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '8px',
      borderLeft: '4px solid #FFA726',
      margin: '20px 0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '4px',
        backgroundColor: '#FFA726'
      }}></div>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <svg 
          style={{
            width: '24px',
            height: '24px',
            marginRight: '12px',
            color: '#FFA726'
          }} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#FFA726'
        }}>
          SERVICE ALERT
        </h3>
      </div>
      
      {/* Message */}
      <p style={{
        margin: 0,
        lineHeight: '1.5',
        paddingLeft: '36px' // Align with icon
      }}>
        Due to track maintenance, trains on the Central Line will experience delays of 10-15 minutes between 9PM and midnight until Friday. Please plan your journey accordingly.
      </p>
    </div>
  );
};

export default ImportantNotice;