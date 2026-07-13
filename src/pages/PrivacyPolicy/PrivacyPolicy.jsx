import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container fade-in">
      <div className="privacy-content glass-panel">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to b4interview.com. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
        </section>

        <section>
          <h2>2. The data we collect about you</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
          <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address, WhatsApp number, and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            <li><strong>Profile Data</strong> includes your uploaded CVs, interview questions, and feedback.</li>
          </ul>
        </section>

        <section>
          <h2>3. How we use your personal data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Services (WhatsApp & Meta)</h2>
          <p>If you opt-in to receive interview reminders via WhatsApp, your phone number and limited profile data will be shared with Meta Platforms, Inc. (WhatsApp) for the sole purpose of delivering these messages. We do not use your phone number for marketing without explicit consent.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at support@b4interview.com.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
