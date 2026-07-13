import React from 'react';
import './Feedback.css';

const Feedback = () => {
  return (
    <div className="feedback-container fade-in">
      <div className="feedback-header">
        <h1>Feedback</h1>
        <p>We'd love to hear your thoughts on how we can improve b4interview.</p>
      </div>
      
      <div className="feedback-form-wrapper">
        <iframe 
          src="https://docs.google.com/forms/d/e/1FAIpQLSfbA592HUhm-07eH78IDVM0zkZMFxbG45WVBuXS7f63H3gI8g/viewform?embedded=true" 
          width="100%" 
          height="800" 
          frameBorder="0" 
          marginHeight="0" 
          marginWidth="0"
          title="b4interview Feedback Form"
          style={{ background: 'transparent' }}
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
};

export default Feedback;
